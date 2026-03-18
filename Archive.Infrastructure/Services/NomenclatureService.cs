using Archive.Application.Common;
using Archive.Application.DTOs;
using Archive.Application.Features.Nomenclatures;
using Archive.Application.Validation;
using Archive.Contracts.Nomenclatures;
using Archive.Domain.Common;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public sealed class NomenclatureService(ArchiveDbContext dbContext) : INomenclatureService
{
    public async Task<NomenclatureBootstrapDto> GetBootstrapAsync(CancellationToken cancellationToken)
    {
        var catalogs = new Dictionary<string, IReadOnlyCollection<NomenclatureItemDto>>
        {
            ["faculties"] = await GetCatalogAsync("faculties", cancellationToken),
            ["departments"] = await GetCatalogAsync("departments", cancellationToken),
            ["studyCycles"] = await GetCatalogAsync("studyCycles", cancellationToken),
            ["studyFrequencies"] = await GetCatalogAsync("studyFrequencies", cancellationToken),
            ["fundingTypes"] = await GetCatalogAsync("fundingTypes", cancellationToken),
            ["academicYears"] = await GetCatalogAsync("academicYears", cancellationToken),
            ["studyYears"] = await GetCatalogAsync("studyYears", cancellationToken),
            ["studyPrograms"] = await GetCatalogAsync("studyPrograms", cancellationToken),
            ["groups"] = await GetCatalogAsync("groups", cancellationToken),
            ["subjects"] = await GetCatalogAsync("subjects", cancellationToken),
            ["studentStatuses"] = await GetCatalogAsync("studentStatuses", cancellationToken),
            ["documentCategories"] = await GetCatalogAsync("documentCategories", cancellationToken),
            ["documentTypes"] = await GetCatalogAsync("documentTypes", cancellationToken),
            ["archiveLocations"] = await GetCatalogAsync("archiveLocations", cancellationToken)
        };

        var faculties = await dbContext.Faculties.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken);
        var departments = await dbContext.Departments.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken);
        var studyCycles = await dbContext.StudyCycles.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken);
        var studyFrequencies = await dbContext.StudyFrequencies.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken);
        var fundingTypes = await dbContext.FundingTypes.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken);
        var academicYears = await dbContext.AcademicYears.AsNoTracking().OrderByDescending(item => item.StartYear).ToListAsync(cancellationToken);
        var studyYears = await dbContext.StudyYears.AsNoTracking().OrderBy(item => item.YearNumber).ToListAsync(cancellationToken);
        var studyPrograms = await dbContext.StudyPrograms.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken);
        var documentCategories = await dbContext.DocumentCategories.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken);

        var lookups = new Dictionary<string, IReadOnlyCollection<LookupItemDto>>
        {
            ["faculties"] = faculties.Select(MapLookup).ToList(),
            ["departments"] = departments.Select(MapLookup).ToList(),
            ["studyCycles"] = studyCycles.Select(MapLookup).ToList(),
            ["studyFrequencies"] = studyFrequencies.Select(MapLookup).ToList(),
            ["fundingTypes"] = fundingTypes.Select(MapLookup).ToList(),
            ["academicYears"] = academicYears.Select(MapLookup).ToList(),
            ["studyYears"] = studyYears.Select(MapLookup).ToList(),
            ["studyPrograms"] = studyPrograms.Select(MapLookup).ToList(),
            ["documentCategories"] = documentCategories.Select(MapLookup).ToList()
        };

        return new NomenclatureBootstrapDto
        {
            Catalogs = catalogs,
            Lookups = lookups
        };
    }

    public async Task<IReadOnlyCollection<NomenclatureItemDto>> GetCatalogAsync(string catalog, CancellationToken cancellationToken)
    {
        var normalized = Normalize(catalog);

        return normalized switch
        {
            "faculties" => (await dbContext.Faculties.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("faculties", item, null, null)).ToList(),
            "departments" => (await dbContext.Departments.AsNoTracking().Include(item => item.Faculty).OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("departments", item, $"Faculty: {item.Faculty!.Name}", new Dictionary<string, Guid?> { ["facultyId"] = item.FacultyId })).ToList(),
            "studycycles" => (await dbContext.StudyCycles.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("studyCycles", item, null, null)).ToList(),
            "studyfrequencies" => (await dbContext.StudyFrequencies.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("studyFrequencies", item, null, null)).ToList(),
            "fundingtypes" => (await dbContext.FundingTypes.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("fundingTypes", item, null, null)).ToList(),
            "academicyears" => (await dbContext.AcademicYears.AsNoTracking().OrderByDescending(item => item.StartYear).ToListAsync(cancellationToken)).Select(item => MapItem("academicYears", item, $"{item.StartYear}-{item.EndYear}{(item.IsCurrent ? " current" : string.Empty)}", new Dictionary<string, Guid?>(), new Dictionary<string, string?> { ["startYear"] = item.StartYear.ToString(), ["endYear"] = item.EndYear.ToString(), ["isCurrent"] = item.IsCurrent.ToString() })).ToList(),
            "studyyears" => (await dbContext.StudyYears.AsNoTracking().OrderBy(item => item.YearNumber).ToListAsync(cancellationToken)).Select(item => MapItem("studyYears", item, $"Year {item.YearNumber}", new Dictionary<string, Guid?>(), new Dictionary<string, string?> { ["yearNumber"] = item.YearNumber.ToString() })).ToList(),
            "studyprograms" => (await dbContext.StudyPrograms.AsNoTracking().Include(item => item.Faculty).Include(item => item.Department).Include(item => item.StudyCycle).Include(item => item.StudyFrequency).OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("studyPrograms", item, $"{item.Faculty!.Name} / {item.Department!.Name} / {item.StudyCycle!.Name}", new Dictionary<string, Guid?> { ["facultyId"] = item.FacultyId, ["departmentId"] = item.DepartmentId, ["studyCycleId"] = item.StudyCycleId, ["studyFrequencyId"] = item.StudyFrequencyId })).ToList(),
            "groups" => (await dbContext.Groups.AsNoTracking().Include(item => item.StudyProgram).Include(item => item.AcademicYear).Include(item => item.StudyYear).OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("groups", item, $"{item.StudyProgram!.Name} / {item.AcademicYear!.Name} / {item.StudyYear!.Name}", new Dictionary<string, Guid?> { ["studyProgramId"] = item.StudyProgramId, ["academicYearId"] = item.AcademicYearId, ["studyYearId"] = item.StudyYearId })).ToList(),
            "subjects" => (await dbContext.Subjects.AsNoTracking().Include(item => item.Department).OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("subjects", item, $"{item.Department!.Name} / {item.Credits} credits", new Dictionary<string, Guid?> { ["departmentId"] = item.DepartmentId }, new Dictionary<string, string?> { ["credits"] = item.Credits.ToString() })).ToList(),
            "studentstatuses" => (await dbContext.StudentStatuses.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("studentStatuses", item, null, null)).ToList(),
            "documentcategories" => (await dbContext.DocumentCategories.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("documentCategories", item, null, null)).ToList(),
            "documenttypes" => (await dbContext.DocumentTypes.AsNoTracking().Include(item => item.DocumentCategory).OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("documentTypes", item, $"Category: {item.DocumentCategory!.Name}", new Dictionary<string, Guid?> { ["documentCategoryId"] = item.DocumentCategoryId })).ToList(),
            "archivelocations" => (await dbContext.ArchiveLocations.AsNoTracking().OrderBy(item => item.Name).ToListAsync(cancellationToken)).Select(item => MapItem("archiveLocations", item, $"{item.Room} / {item.Shelf}", new Dictionary<string, Guid?>(), new Dictionary<string, string?> { ["room"] = item.Room, ["shelf"] = item.Shelf })).ToList(),
            _ => throw new AppException("Unknown nomenclature catalog.", 404)
        };
    }

    public async Task<NomenclatureItemDto> UpsertAsync(string catalog, Guid? id, UpsertNomenclatureItemRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);
        var normalized = Normalize(catalog);

        switch (normalized)
        {
            case "faculties":
                return await UpsertBaseAsync(dbContext.Faculties, "faculties", id, request, cancellationToken);
            case "departments":
                ValidationExtensions.EnsureNotEmpty(request.FacultyId ?? Guid.Empty, nameof(request.FacultyId));
                return await UpsertAsync(dbContext.Departments, "departments", id, request, (entity, payload) => entity.FacultyId = payload.FacultyId!.Value, cancellationToken);
            case "studycycles":
                return await UpsertBaseAsync(dbContext.StudyCycles, "studyCycles", id, request, cancellationToken);
            case "studyfrequencies":
                return await UpsertBaseAsync(dbContext.StudyFrequencies, "studyFrequencies", id, request, cancellationToken);
            case "fundingtypes":
                return await UpsertBaseAsync(dbContext.FundingTypes, "fundingTypes", id, request, cancellationToken);
            case "academicyears":
                return await UpsertAsync(dbContext.AcademicYears, "academicYears", id, request, (entity, payload) =>
                {
                    entity.StartYear = payload.StartYear ?? DateTime.UtcNow.Year;
                    entity.EndYear = payload.EndYear ?? DateTime.UtcNow.Year + 1;
                    entity.IsCurrent = payload.StartYear.HasValue && payload.EndYear.HasValue && payload.EndYear.Value >= DateTime.UtcNow.Year;
                }, cancellationToken);
            case "studyyears":
                return await UpsertAsync(dbContext.StudyYears, "studyYears", id, request, (entity, payload) => entity.YearNumber = payload.YearNumber ?? 1, cancellationToken);
            case "studyprograms":
                ValidationExtensions.EnsureNotEmpty(request.FacultyId ?? Guid.Empty, nameof(request.FacultyId));
                ValidationExtensions.EnsureNotEmpty(request.DepartmentId ?? Guid.Empty, nameof(request.DepartmentId));
                ValidationExtensions.EnsureNotEmpty(request.StudyCycleId ?? Guid.Empty, nameof(request.StudyCycleId));
                ValidationExtensions.EnsureNotEmpty(request.StudyFrequencyId ?? Guid.Empty, nameof(request.StudyFrequencyId));
                return await UpsertAsync(dbContext.StudyPrograms, "studyPrograms", id, request, (entity, payload) =>
                {
                    entity.FacultyId = payload.FacultyId!.Value;
                    entity.DepartmentId = payload.DepartmentId!.Value;
                    entity.StudyCycleId = payload.StudyCycleId!.Value;
                    entity.StudyFrequencyId = payload.StudyFrequencyId!.Value;
                }, cancellationToken);
            case "groups":
                ValidationExtensions.EnsureNotEmpty(request.StudyProgramId ?? Guid.Empty, nameof(request.StudyProgramId));
                ValidationExtensions.EnsureNotEmpty(request.AcademicYearId ?? Guid.Empty, nameof(request.AcademicYearId));
                ValidationExtensions.EnsureNotEmpty(request.StudyYearId ?? Guid.Empty, nameof(request.StudyYearId));
                return await UpsertAsync(dbContext.Groups, "groups", id, request, (entity, payload) =>
                {
                    entity.StudyProgramId = payload.StudyProgramId!.Value;
                    entity.AcademicYearId = payload.AcademicYearId!.Value;
                    entity.StudyYearId = payload.StudyYearId!.Value;
                }, cancellationToken);
            case "subjects":
                ValidationExtensions.EnsureNotEmpty(request.DepartmentId ?? Guid.Empty, nameof(request.DepartmentId));
                return await UpsertAsync(dbContext.Subjects, "subjects", id, request, (entity, payload) =>
                {
                    entity.DepartmentId = payload.DepartmentId!.Value;
                    entity.Credits = payload.Credits ?? 0;
                }, cancellationToken);
            case "studentstatuses":
                return await UpsertBaseAsync(dbContext.StudentStatuses, "studentStatuses", id, request, cancellationToken);
            case "documentcategories":
                return await UpsertBaseAsync(dbContext.DocumentCategories, "documentCategories", id, request, cancellationToken);
            case "documenttypes":
                ValidationExtensions.EnsureNotEmpty(request.DocumentCategoryId ?? Guid.Empty, nameof(request.DocumentCategoryId));
                return await UpsertAsync(dbContext.DocumentTypes, "documentTypes", id, request, (entity, payload) => entity.DocumentCategoryId = payload.DocumentCategoryId!.Value, cancellationToken);
            case "archivelocations":
                return await UpsertAsync(dbContext.ArchiveLocations, "archiveLocations", id, request, (entity, payload) =>
                {
                    entity.Room = payload.Room;
                    entity.Shelf = payload.Shelf;
                }, cancellationToken);
            default:
                throw new AppException("Unknown nomenclature catalog.", 404);
        }
    }

    private static string Normalize(string value) => value.Replace("-", string.Empty).Replace("_", string.Empty).Trim().ToLowerInvariant();

    private static LookupItemDto MapLookup(NomenclatureEntity entity) => new() { Id = entity.Id, Code = entity.Code, Name = entity.Name };

    private static NomenclatureItemDto MapItem(string catalog, NomenclatureEntity entity, string? secondaryLabel, Dictionary<string, Guid?>? relationIds, Dictionary<string, string?>? metadata = null) =>
        new()
        {
            Id = entity.Id,
            Catalog = catalog,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            IsActive = entity.IsActive,
            SecondaryLabel = secondaryLabel,
            RelationIds = relationIds ?? new Dictionary<string, Guid?>(),
            Metadata = metadata ?? new Dictionary<string, string?>()
        };

    private async Task<NomenclatureItemDto> UpsertBaseAsync<TEntity>(DbSet<TEntity> set, string catalog, Guid? id, UpsertNomenclatureItemRequest request, CancellationToken cancellationToken)
        where TEntity : NomenclatureEntity, new() =>
        await UpsertAsync(set, catalog, id, request, static (_, _) => { }, cancellationToken);

    private async Task<NomenclatureItemDto> UpsertAsync<TEntity>(DbSet<TEntity> set, string catalog, Guid? id, UpsertNomenclatureItemRequest request, Action<TEntity, UpsertNomenclatureItemRequest> applySpecific, CancellationToken cancellationToken)
        where TEntity : NomenclatureEntity, new()
    {
        var entity = id.HasValue
            ? await set.FirstOrDefaultAsync(item => item.Id == id.Value, cancellationToken) ?? throw new AppException("Nomenclature item not found.", 404)
            : new TEntity();

        entity.Code = request.Code.Trim();
        entity.Name = request.Name.Trim();
        entity.Description = request.Description?.Trim();
        entity.IsActive = request.IsActive;
        applySpecific(entity, request);

        if (!id.HasValue)
        {
            await set.AddAsync(entity, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        var items = await GetCatalogAsync(catalog, cancellationToken);
        return items.First(item => item.Id == entity.Id);
    }
}
