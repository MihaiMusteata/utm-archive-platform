using Archive.Domain.Common;

namespace Archive.Domain.Entities;

public sealed class Document : AuditableEntity
{
    public Guid StudentId { get; set; }
    public Guid DocumentTypeId { get; set; }
    public Guid DocumentCategoryId { get; set; }
    public Guid? ArchiveLocationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public long Size { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty;
    public int CurrentVersionNumber { get; set; } = 1;

    public Student? Student { get; set; }
    public DocumentType? DocumentType { get; set; }
    public DocumentCategory? DocumentCategory { get; set; }
    public ArchiveLocation? ArchiveLocation { get; set; }
    public ICollection<DocumentVersion> Versions { get; set; } = new List<DocumentVersion>();
}

public sealed class DocumentVersion : AuditableEntity
{
    public Guid DocumentId { get; set; }
    public int VersionNumber { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public long Size { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty;
    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;

    public Document? Document { get; set; }
}
