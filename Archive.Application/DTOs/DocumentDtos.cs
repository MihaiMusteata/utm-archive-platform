namespace Archive.Application.DTOs;

public sealed class StoredFileDto
{
    public string FileName { get; init; } = string.Empty;
    public string StoredFileName { get; init; } = string.Empty;
    public string StoragePath { get; init; } = string.Empty;
    public long Size { get; init; }
    public string MimeType { get; init; } = string.Empty;
    public string Hash { get; init; } = string.Empty;
}

public sealed class DocumentDto
{
    public Guid Id { get; init; }
    public Guid StudentId { get; init; }
    public string StudentName { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long Size { get; init; }
    public string DocumentType { get; init; } = string.Empty;
    public string DocumentCategory { get; init; } = string.Empty;
    public string? ArchiveLocation { get; init; }
    public string Hash { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
}
