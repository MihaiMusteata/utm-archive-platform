using System.ComponentModel.DataAnnotations;

namespace Archive.Contracts.Nomenclatures;

public sealed class UpsertNomenclatureItemRequest
{
    [Required]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? FacultyId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? StudyCycleId { get; set; }
    public Guid? StudyFrequencyId { get; set; }
    public Guid? StudyProgramId { get; set; }
    public Guid? AcademicYearId { get; set; }
    public Guid? StudyYearId { get; set; }
    public Guid? DocumentCategoryId { get; set; }
    public string? Room { get; set; }
    public string? Shelf { get; set; }
    public int? StartYear { get; set; }
    public int? EndYear { get; set; }
    public int? YearNumber { get; set; }
    public int? Credits { get; set; }
}
