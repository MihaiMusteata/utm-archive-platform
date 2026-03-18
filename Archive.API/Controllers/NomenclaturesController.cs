using Archive.API.Security;
using Archive.Application.Features.Nomenclatures;
using Archive.Contracts.Nomenclatures;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers;

[ApiController]
[Route("api/nomenclatures")]
public sealed class NomenclaturesController(INomenclatureService nomenclatureService) : ControllerBase
{
    [HttpGet("bootstrap")]
    [HasPermission("nomenclatures.view")]
    public async Task<IActionResult> GetBootstrap(CancellationToken cancellationToken) =>
        Ok(await nomenclatureService.GetBootstrapAsync(cancellationToken));

    [HttpGet("{catalog}")]
    [HasPermission("nomenclatures.view")]
    public async Task<IActionResult> GetCatalog(string catalog, CancellationToken cancellationToken) =>
        Ok(await nomenclatureService.GetCatalogAsync(catalog, cancellationToken));

    [HttpPost("{catalog}")]
    [HasPermission("nomenclatures.manage")]
    public async Task<IActionResult> Create(string catalog, [FromBody] UpsertNomenclatureItemRequest request, CancellationToken cancellationToken) =>
        Ok(await nomenclatureService.UpsertAsync(catalog, null, request, cancellationToken));

    [HttpPut("{catalog}/{id:guid}")]
    [HasPermission("nomenclatures.manage")]
    public async Task<IActionResult> Update(string catalog, Guid id, [FromBody] UpsertNomenclatureItemRequest request, CancellationToken cancellationToken) =>
        Ok(await nomenclatureService.UpsertAsync(catalog, id, request, cancellationToken));
}
