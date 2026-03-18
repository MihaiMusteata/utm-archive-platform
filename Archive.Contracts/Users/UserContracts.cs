using Archive.Contracts.Common;
using System.ComponentModel.DataAnnotations;

namespace Archive.Contracts.Users;

public sealed class UserListRequest : PagedRequest
{
    public bool? IsActive { get; set; }
}

public sealed class CreateUserRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public List<Guid> RoleIds { get; set; } = new();
}

public sealed class UpdateUserRequest
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public string? Password { get; set; }
    public bool IsActive { get; set; } = true;
    public List<Guid> RoleIds { get; set; } = new();
}
