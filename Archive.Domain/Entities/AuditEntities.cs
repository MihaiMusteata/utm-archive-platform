using Archive.Domain.Common;

namespace Archive.Domain.Entities;

public sealed class AuditLog : AuditableEntity
{
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? Route { get; set; }
    public string? Method { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DetailsJson { get; set; }

    public User? ActorUser { get; set; }
}
