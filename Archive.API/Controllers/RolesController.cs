using Archive.API.Security;
using Archive.Application.Features.Roles;
using Archive.Contracts.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public sealed class RolesController(IRolesService rolesService) : ControllerBase
{
    [HttpGet]
    [HasPermission("roles.view")]
    public async Task<IActionResult> GetRoles([FromQuery] RoleListRequest request, CancellationToken cancellationToken) =>
        Ok(await rolesService.GetRolesAsync(request, cancellationToken));

    [HttpGet("permissions")]
    [HasPermission("roles.view")]
    public async Task<IActionResult> GetPermissions(CancellationToken cancellationToken) =>
        Ok(await rolesService.GetPermissionsAsync(cancellationToken));

    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    [HasPermission("roles.manage")]
    public async Task<IActionResult> Create([FromBody] CreateRoleRequest request, CancellationToken cancellationToken) =>
        Ok(await rolesService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SuperAdmin")]
    [HasPermission("roles.manage")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleRequest request, CancellationToken cancellationToken) =>
        Ok(await rolesService.UpdateAsync(id, request, cancellationToken));
}
