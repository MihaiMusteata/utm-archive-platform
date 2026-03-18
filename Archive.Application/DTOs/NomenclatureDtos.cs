namespace Archive.Application.DTOs;

public sealed class LookupItemDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

public sealed class NomenclatureItemDto
{
    public Guid Id { get; init; }
    public string Catalog { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public string? SecondaryLabel { get; init; }
    public Dictionary<string, Guid?> RelationIds { get; init; } = new();
    public Dictionary<string, string?> Metadata { get; init; } = new();
}

public sealed class NomenclatureBootstrapDto
{
    public Dictionary<string, IReadOnlyCollection<NomenclatureItemDto>> Catalogs { get; init; } = new();
    public Dictionary<string, IReadOnlyCollection<LookupItemDto>> Lookups { get; init; } = new();
}
