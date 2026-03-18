using Archive.API.Security;
using Archive.Application.Features.Audit;
using Archive.Contracts.Audit;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers;

[ApiController]
[Route("api/audit")]
public sealed class AuditController(IAuditService auditService) : ControllerBase
{
    [HttpGet]
    [HasPermission("audit.view")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] AuditListRequest request, CancellationToken cancellationToken) =>
        Ok(await auditService.GetAuditLogsAsync(request, cancellationToken));
}
