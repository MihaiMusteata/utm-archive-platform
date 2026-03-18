namespace Archive.Application.DTOs;

public sealed class DashboardSummaryDto
{
    public int StudentsCount { get; init; }
    public int ActiveStudentsCount { get; init; }
    public int DocumentsCount { get; init; }
    public int UsersCount { get; init; }
    public IReadOnlyCollection<DocumentDto> RecentDocuments { get; init; } = Array.Empty<DocumentDto>();
    public IReadOnlyCollection<AuditLogDto> RecentAuditLogs { get; init; } = Array.Empty<AuditLogDto>();
}
