using Archive.Application.DTOs;
using Archive.Application.Features.Audit;
using Archive.Contracts.Audit;
using Archive.Contracts.Common;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public sealed class AuditService(ArchiveDbContext dbContext) : IAuditService
{
    public async Task<PagedResponse<AuditLogDto>> GetAuditLogsAsync(AuditListRequest request, CancellationToken cancellationToken)
    {
        var query = dbContext.AuditLogs
            .AsNoTracking()
            .Include(log => log.ActorUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(log =>
                log.EntityName.ToLower().Contains(search) ||
                (log.EntityId ?? string.Empty).ToLower().Contains(search) ||
                (log.ActorUser != null && log.ActorUser.Username.ToLower().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(request.EntityName))
        {
            var entityName = request.EntityName.Trim().ToLower();
            query = query.Where(log => log.EntityName.ToLower() == entityName);
        }

        if (!string.IsNullOrWhiteSpace(request.Action))
        {
            var action = request.Action.Trim().ToLower();
            query = query.Where(log => log.Action.ToLower() == action);
        }

        return await query.OrderByDescending(log => log.CreatedAt).ToPagedResponseAsync(request.Page, request.PageSize, log => log.ToDto(), cancellationToken);
    }
}
