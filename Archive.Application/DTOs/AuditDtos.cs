namespace Archive.Application.DTOs;

public sealed class AuditLogDto
{
    public Guid Id { get; init; }
    public string Action { get; init; } = string.Empty;
    public string EntityName { get; init; } = string.Empty;
    public string? EntityId { get; init; }
    public string? Username { get; init; }
    public string? Route { get; init; }
    public string? Method { get; init; }
    public string? IpAddress { get; init; }
    public string? DetailsJson { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}
