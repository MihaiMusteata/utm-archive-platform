using Archive.Contracts.Common;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Archive.Contracts.Documents;

public sealed class DocumentListRequest : PagedRequest
{
    public Guid? StudentId { get; set; }
    public Guid? DocumentTypeId { get; set; }
    public Guid? DocumentCategoryId { get; set; }
}

public sealed class UploadDocumentRequest
{
    [Required]
    public Guid StudentId { get; set; }

    [Required]
    public Guid DocumentTypeId { get; set; }

    public Guid? DocumentCategoryId { get; set; }
    public Guid? ArchiveLocationId { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public IFormFile File { get; set; } = default!;
}
