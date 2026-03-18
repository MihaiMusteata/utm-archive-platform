using Archive.Contracts.Common;
using System.ComponentModel.DataAnnotations;

namespace Archive.Contracts.Roles;

public sealed class RoleListRequest : PagedRequest
{
}

public sealed class CreateRoleRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public List<Guid> PermissionIds { get; set; } = new();
}

public sealed class UpdateRoleRequest
{
    [Required]
    public string Description { get; set; } = string.Empty;

    public List<Guid> PermissionIds { get; set; } = new();
}
