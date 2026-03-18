using Archive.Application.DTOs;
using Archive.Contracts.Nomenclatures;

namespace Archive.Application.Features.Nomenclatures;

public interface INomenclatureService
{
    Task<NomenclatureBootstrapDto> GetBootstrapAsync(CancellationToken cancellationToken);
    Task<IReadOnlyCollection<NomenclatureItemDto>> GetCatalogAsync(string catalog, CancellationToken cancellationToken);
    Task<NomenclatureItemDto> UpsertAsync(string catalog, Guid? id, UpsertNomenclatureItemRequest request, CancellationToken cancellationToken);
}
