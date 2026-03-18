using Archive.Application.DTOs;
using Archive.Contracts.Audit;
using Archive.Contracts.Common;

namespace Archive.Application.Features.Audit;

public interface IAuditService
{
    Task<PagedResponse<AuditLogDto>> GetAuditLogsAsync(AuditListRequest request, CancellationToken cancellationToken);
}
