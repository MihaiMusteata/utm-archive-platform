using Archive.Contracts.Common;

namespace Archive.Contracts.Audit;

public sealed class AuditListRequest : PagedRequest
{
    public string? EntityName { get; set; }
    public string? Action { get; set; }
}
