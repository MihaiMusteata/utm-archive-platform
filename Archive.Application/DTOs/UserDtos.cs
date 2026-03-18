namespace Archive.Application.DTOs;

public sealed class PermissionDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

public sealed class RoleDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsSystem { get; init; }
    public IReadOnlyCollection<Guid> PermissionIds { get; init; } = Array.Empty<Guid>();
    public IReadOnlyCollection<string> PermissionCodes { get; init; } = Array.Empty<string>();
}

public sealed class UserDto
{
    public Guid Id { get; init; }
    public string Username { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public IReadOnlyCollection<Guid> RoleIds { get; init; } = Array.Empty<Guid>();
    public IReadOnlyCollection<string> Roles { get; init; } = Array.Empty<string>();
}
