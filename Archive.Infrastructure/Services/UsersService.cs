using Archive.Application.Abstractions;
using Archive.Application.Common;
using Archive.Application.DTOs;
using Archive.Application.Features.Users;
using Archive.Application.Validation;
using Archive.Contracts.Common;
using Archive.Contracts.Users;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public sealed class UsersService(ArchiveDbContext dbContext, IPasswordHasher passwordHasher) : IUsersService
{
    public async Task<PagedResponse<UserDto>> GetUsersAsync(UserListRequest request, CancellationToken cancellationToken)
    {
        var query = dbContext.Users
            .AsNoTracking()
            .Include(user => user.UserRoles)
                .ThenInclude(userRole => userRole.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(user =>
                user.Username.ToLower().Contains(search) ||
                user.Email.ToLower().Contains(search) ||
                user.FirstName.ToLower().Contains(search) ||
                user.LastName.ToLower().Contains(search));
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(user => user.IsActive == request.IsActive.Value);
        }

        return await query.OrderBy(user => user.Username).ToPagedResponseAsync(request.Page, request.PageSize, user => user.ToDto(), cancellationToken);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        if (await dbContext.Users.AnyAsync(user => user.Username == request.Username || user.Email == request.Email, cancellationToken))
        {
            throw new AppException("Username or email is already in use.", 409);
        }

        var roles = await dbContext.Roles.Where(role => request.RoleIds.Contains(role.Id)).ToListAsync(cancellationToken);
        var user = new User
        {
            Username = request.Username.Trim(),
            Email = request.Email.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            IsActive = request.IsActive,
            PasswordHash = passwordHasher.HashPassword(request.Password)
        };

        user.UserRoles = roles.Select(role => new UserRole
        {
            RoleId = role.Id
        }).ToList();

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        await dbContext.Entry(user).Collection(current => current.UserRoles).Query().Include(userRole => userRole.Role).LoadAsync(cancellationToken);
        return user.ToDto();
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        var user = await dbContext.Users
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (user is null)
        {
            throw new AppException("User not found.", 404);
        }

        if (await dbContext.Users.AnyAsync(current => current.Id != id && current.Email == request.Email, cancellationToken))
        {
            throw new AppException("Email is already in use.", 409);
        }

        user.Email = request.Email.Trim();
        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = passwordHasher.HashPassword(request.Password.Trim());
        }

        var requestedRoleIds = request.RoleIds
            .Distinct()
            .ToArray();

        var validRoleIds = await dbContext.Roles
            .Where(role => requestedRoleIds.Contains(role.Id))
            .Select(role => role.Id)
            .ToArrayAsync(cancellationToken);

        if (validRoleIds.Length != requestedRoleIds.Length)
        {
            throw new AppException("One or more selected roles are invalid.", 400);
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        await dbContext.UserRoles
            .Where(userRole => userRole.UserId == user.Id)
            .ExecuteDeleteAsync(cancellationToken);

        foreach (var roleId in validRoleIds)
        {
            dbContext.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = roleId
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await dbContext.Entry(user).Collection(current => current.UserRoles).Query().Include(userRole => userRole.Role).LoadAsync(cancellationToken);
        return user.ToDto();
    }
}
