using Archive.Application.Abstractions;
using Archive.Application.Common;
using Archive.Application.DTOs;
using Archive.Application.Features.Documents;
using Archive.Application.Validation;
using Archive.Contracts.Common;
using Archive.Contracts.Documents;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public sealed class DocumentsService(ArchiveDbContext dbContext, IFileStorageService fileStorageService) : IDocumentsService
{
    public async Task<PagedResponse<DocumentDto>> GetDocumentsAsync(DocumentListRequest request, CancellationToken cancellationToken)
    {
        var query = dbContext.Documents
            .AsNoTracking()
            .Include(document => document.Student)
            .Include(document => document.DocumentType)
            .Include(document => document.DocumentCategory)
            .Include(document => document.ArchiveLocation)
            .AsQueryable();

        if (request.StudentId.HasValue)
        {
            query = query.Where(document => document.StudentId == request.StudentId.Value);
        }

        if (request.DocumentTypeId.HasValue)
        {
            query = query.Where(document => document.DocumentTypeId == request.DocumentTypeId.Value);
        }

        if (request.DocumentCategoryId.HasValue)
        {
            query = query.Where(document => document.DocumentCategoryId == request.DocumentCategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(document =>
                document.Title.ToLower().Contains(search) ||
                document.FileName.ToLower().Contains(search) ||
                document.Student!.FirstName.ToLower().Contains(search) ||
                document.Student.LastName.ToLower().Contains(search));
        }

        return await query.OrderByDescending(document => document.CreatedAt).ToPagedResponseAsync(request.Page, request.PageSize, document => document.ToDto(), cancellationToken);
    }

    public async Task<DocumentDto> UploadAsync(UploadDocumentRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        var student = await dbContext.Students.FirstOrDefaultAsync(current => current.Id == request.StudentId, cancellationToken)
                      ?? throw new AppException("Student not found.", 404);

        var documentType = await dbContext.DocumentTypes
                               .Include(current => current.DocumentCategory)
                               .FirstOrDefaultAsync(current => current.Id == request.DocumentTypeId, cancellationToken)
                           ?? throw new AppException("Document type not found.", 404);

        StoredFileDto storedFile;
        await using (var stream = request.File.OpenReadStream())
        {
            storedFile = await fileStorageService.SaveAsync(stream, request.File.FileName, request.File.ContentType, cancellationToken);
        }

        var document = new Document
        {
            StudentId = student.Id,
            DocumentTypeId = documentType.Id,
            DocumentCategoryId = request.DocumentCategoryId ?? documentType.DocumentCategoryId,
            ArchiveLocationId = request.ArchiveLocationId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            FileName = storedFile.FileName,
            StoredFileName = storedFile.StoredFileName,
            StoragePath = storedFile.StoragePath,
            Size = storedFile.Size,
            MimeType = storedFile.MimeType,
            Hash = storedFile.Hash,
            CurrentVersionNumber = 1,
            Versions =
            [
                new DocumentVersion
                {
                    VersionNumber = 1,
                    FileName = storedFile.FileName,
                    StoredFileName = storedFile.StoredFileName,
                    StoragePath = storedFile.StoragePath,
                    Size = storedFile.Size,
                    MimeType = storedFile.MimeType,
                    Hash = storedFile.Hash,
                    UploadedAt = DateTimeOffset.UtcNow
                }
            ]
        };

        dbContext.Documents.Add(document);
        await dbContext.SaveChangesAsync(cancellationToken);

        await dbContext.Entry(document).Reference(current => current.Student).LoadAsync(cancellationToken);
        await dbContext.Entry(document).Reference(current => current.DocumentType).LoadAsync(cancellationToken);
        await dbContext.Entry(document).Reference(current => current.DocumentCategory).LoadAsync(cancellationToken);
        if (document.ArchiveLocationId.HasValue)
        {
            await dbContext.Entry(document).Reference(current => current.ArchiveLocation).LoadAsync(cancellationToken);
        }

        return document.ToDto();
    }

    public async Task<(Stream Stream, string FileName, string ContentType)> DownloadAsync(Guid id, CancellationToken cancellationToken)
    {
        var document = await dbContext.Documents.FirstOrDefaultAsync(current => current.Id == id, cancellationToken)
                       ?? throw new AppException("Document not found.", 404);

        dbContext.AuditLogs.Add(new AuditLog
        {
            ActorUserId = null,
            Action = "DOWNLOAD",
            EntityName = nameof(Document),
            EntityId = document.Id.ToString(),
            Route = "/api/documents/" + document.Id + "/download",
            Method = "GET",
            DetailsJson = "{\"message\":\"Document downloaded.\"}"
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        var stream = await fileStorageService.OpenReadAsync(document.StoragePath, cancellationToken);
        return (stream, document.FileName, document.MimeType);
    }
}
