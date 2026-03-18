using Archive.Application.DTOs;
using Archive.Contracts.Common;
using Archive.Contracts.Users;

namespace Archive.Application.Features.Users;

public interface IUsersService
{
    Task<PagedResponse<UserDto>> GetUsersAsync(UserListRequest request, CancellationToken cancellationToken);
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken cancellationToken);
}
