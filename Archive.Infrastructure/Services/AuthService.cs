using Archive.Application.Abstractions;
using Archive.Application.Common;
using Archive.Application.DTOs;
using Archive.Application.Features.Auth;
using Archive.Application.Validation;
using Archive.Contracts.Auth;
using Archive.Domain.Entities;
using Archive.Infrastructure.Options;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Archive.Infrastructure.Services;

public sealed class AuthService(
    ArchiveDbContext dbContext,
    IPasswordHasher passwordHasher,
    ITokenService tokenService,
    ICurrentUserService currentUserService,
    IDateTimeProvider dateTimeProvider,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    public async Task<LoginResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        var user = await GetUserForAuthAsync(request.Username, cancellationToken);
        if (user is null || !user.IsActive || !passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new AppException("Invalid username or password.", 401);
        }

        var response = await IssueTokensAsync(user, cancellationToken);
        user.LastLoginAt = dateTimeProvider.UtcNow;

        dbContext.AuditLogs.Add(new AuditLog
        {
            ActorUserId = user.Id,
            Action = "LOGIN",
            EntityName = nameof(User),
            EntityId = user.Id.ToString(),
            Route = currentUserService.Route ?? "/api/auth/login",
            Method = currentUserService.HttpMethod ?? "POST",
            IpAddress = currentUserService.IpAddress,
            UserAgent = currentUserService.UserAgent,
            DetailsJson = "{\"message\":\"User logged in.\"}"
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task<LoginResponseDto> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new AppException("Refresh token is required.", 400);
        }

        var refreshTokenHash = tokenService.HashRefreshToken(request.RefreshToken);
        var refreshToken = await dbContext.RefreshTokens
            .Include(token => token.User!)
                .ThenInclude(user => user.UserRoles)
                    .ThenInclude(userRole => userRole.Role!)
                        .ThenInclude(role => role.RolePermissions)
                            .ThenInclude(rolePermission => rolePermission.Permission)
            .FirstOrDefaultAsync(token => token.TokenHash == refreshTokenHash, cancellationToken);

        if (refreshToken is null || refreshToken.RevokedAt is not null || refreshToken.ExpiresAt <= dateTimeProvider.UtcNow || refreshToken.User is null || !refreshToken.User.IsActive)
        {
            throw new AppException("Refresh token is invalid or expired.", 401);
        }

        refreshToken.RevokedAt = dateTimeProvider.UtcNow;
        var response = await IssueTokensAsync(refreshToken.User, cancellationToken, refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return response;
    }

    public async Task<CurrentUserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .Include(current => current.UserRoles)
                .ThenInclude(userRole => userRole.Role!)
                    .ThenInclude(role => role.RolePermissions)
                        .ThenInclude(rolePermission => rolePermission.Permission)
            .FirstOrDefaultAsync(current => current.Id == userId, cancellationToken);

        if (user is null)
        {
            throw new AppException("User not found.", 404);
        }

        var roles = user.UserRoles.Select(userRole => userRole.Role!.Name).Distinct().OrderBy(static value => value).ToArray();
        var permissions = user.UserRoles
            .SelectMany(userRole => userRole.Role!.RolePermissions)
            .Select(rolePermission => rolePermission.Permission!.Code)
            .Distinct()
            .OrderBy(static value => value)
            .ToArray();

        return user.ToCurrentUserDto(roles, permissions);
    }

    private async Task<User?> GetUserForAuthAsync(string username, CancellationToken cancellationToken) =>
        await dbContext.Users
            .Include(user => user.UserRoles)
                .ThenInclude(userRole => userRole.Role!)
                    .ThenInclude(role => role.RolePermissions)
                        .ThenInclude(rolePermission => rolePermission.Permission)
            .FirstOrDefaultAsync(user => user.Username == username || user.Email == username, cancellationToken);

    private async Task<LoginResponseDto> IssueTokensAsync(User user, CancellationToken cancellationToken, RefreshToken? previousToken = null)
    {
        var roles = user.UserRoles.Select(userRole => userRole.Role!.Name).Distinct().OrderBy(static value => value).ToArray();
        var permissions = user.UserRoles
            .SelectMany(userRole => userRole.Role!.RolePermissions)
            .Select(rolePermission => rolePermission.Permission!.Code)
            .Distinct()
            .OrderBy(static value => value)
            .ToArray();

        var accessToken = tokenService.CreateAccessToken(user, roles, permissions);
        var refreshTokenValue = tokenService.CreateRefreshToken();
        var refreshTokenHash = tokenService.HashRefreshToken(refreshTokenValue);

        dbContext.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            ExpiresAt = dateTimeProvider.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays),
            CreatedByIp = currentUserService.IpAddress,
            ReplacedByTokenHash = previousToken?.TokenHash
        });

        await Task.CompletedTask;

        return new LoginResponseDto
        {
            AccessToken = accessToken.AccessToken,
            RefreshToken = refreshTokenValue,
            ExpiresAt = accessToken.ExpiresAt,
            User = user.ToCurrentUserDto(roles, permissions)
        };
    }
}
