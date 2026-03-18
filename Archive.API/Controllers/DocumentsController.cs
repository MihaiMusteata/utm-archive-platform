using Archive.API.Security;
using Archive.Application.Features.Documents;
using Archive.Contracts.Documents;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers;

[ApiController]
[Route("api/documents")]
public sealed class DocumentsController(IDocumentsService documentsService) : ControllerBase
{
    [HttpGet]
    [HasPermission("documents.view")]
    public async Task<IActionResult> GetDocuments([FromQuery] DocumentListRequest request, CancellationToken cancellationToken) =>
        Ok(await documentsService.GetDocumentsAsync(request, cancellationToken));

    [HttpPost("upload")]
    [HasPermission("documents.upload")]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> Upload([FromForm] UploadDocumentRequest request, CancellationToken cancellationToken) =>
        Ok(await documentsService.UploadAsync(request, cancellationToken));

    [HttpGet("{id:guid}/download")]
    [HasPermission("documents.download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var document = await documentsService.DownloadAsync(id, cancellationToken);
        return File(document.Stream, document.ContentType, document.FileName);
    }
}
