using Archive.Application.DTOs;
using Archive.Application.Features.Dashboard;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public sealed class DashboardService(ArchiveDbContext dbContext) : IDashboardService
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken)
    {
        var studentsCount = await dbContext.Students.CountAsync(cancellationToken);
        var activeStudentsCount = await dbContext.Students.Include(student => student.StudentStatus).CountAsync(student => student.StudentStatus!.Code == "ACTIVE", cancellationToken);
        var documentsCount = await dbContext.Documents.CountAsync(cancellationToken);
        var usersCount = await dbContext.Users.CountAsync(cancellationToken);

        var recentDocuments = (await dbContext.Documents
            .AsNoTracking()
            .Include(document => document.Student)
            .Include(document => document.DocumentType)
            .Include(document => document.DocumentCategory)
            .Include(document => document.ArchiveLocation)
            .OrderByDescending(document => document.CreatedAt)
            .Take(5)
            .ToListAsync(cancellationToken)).Select(document => document.ToDto()).ToList();

        var recentAuditLogs = (await dbContext.AuditLogs
            .AsNoTracking()
            .Include(log => log.ActorUser)
            .OrderByDescending(log => log.CreatedAt)
            .Take(8)
            .ToListAsync(cancellationToken)).Select(log => log.ToDto()).ToList();

        return new DashboardSummaryDto
        {
            StudentsCount = studentsCount,
            ActiveStudentsCount = activeStudentsCount,
            DocumentsCount = documentsCount,
            UsersCount = usersCount,
            RecentDocuments = recentDocuments,
            RecentAuditLogs = recentAuditLogs
        };
    }
}
