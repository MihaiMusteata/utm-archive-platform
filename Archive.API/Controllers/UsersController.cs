using Archive.API.Security;
using Archive.Application.Features.Users;
using Archive.Contracts.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public sealed class UsersController(IUsersService usersService) : ControllerBase
{
    [HttpGet]
    [HasPermission("users.view")]
    public async Task<IActionResult> GetUsers([FromQuery] UserListRequest request, CancellationToken cancellationToken) =>
        Ok(await usersService.GetUsersAsync(request, cancellationToken));

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    [HasPermission("users.manage")]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken) =>
        Ok(await usersService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    [HasPermission("users.manage")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken) =>
        Ok(await usersService.UpdateAsync(id, request, cancellationToken));
}
