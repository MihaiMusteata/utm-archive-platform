using Archive.Application.DTOs;
using Archive.Contracts.Auth;

namespace Archive.Application.Features.Auth;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<LoginResponseDto> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken);
    Task<CurrentUserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);
}
