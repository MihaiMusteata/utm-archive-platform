using Archive.Application.DTOs;
using Archive.Contracts.Common;
using Archive.Contracts.Documents;

namespace Archive.Application.Features.Documents;

public interface IDocumentsService
{
    Task<PagedResponse<DocumentDto>> GetDocumentsAsync(DocumentListRequest request, CancellationToken cancellationToken);
    Task<DocumentDto> UploadAsync(UploadDocumentRequest request, CancellationToken cancellationToken);
    Task<(Stream Stream, string FileName, string ContentType)> DownloadAsync(Guid id, CancellationToken cancellationToken);
}
