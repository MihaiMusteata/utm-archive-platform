using Archive.Application.DTOs;
using Archive.Contracts.Common;
using Archive.Contracts.Roles;

namespace Archive.Application.Features.Roles;

public interface IRolesService
{
    Task<PagedResponse<RoleDto>> GetRolesAsync(RoleListRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<PermissionDto>> GetPermissionsAsync(CancellationToken cancellationToken);
    Task<RoleDto> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken);
    Task<RoleDto> UpdateAsync(Guid id, UpdateRoleRequest request, CancellationToken cancellationToken);
}
