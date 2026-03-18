using Archive.Contracts.Common;
using Archive.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Archive.Contracts.Students;

public sealed class StudentListRequest : PagedRequest
{
    public Guid? FacultyId { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? StudyProgramId { get; set; }
    public Guid? GroupId { get; set; }
    public Guid? StudentStatusId { get; set; }
}

public sealed class StudentUpsertRequest
{
    [Required]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required]
    public string NationalId { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public DateOnly EnrollmentDate { get; set; }
    public DateOnly? GraduationDate { get; set; }
    public Guid FacultyId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid StudyProgramId { get; set; }
    public Guid GroupId { get; set; }
    public Guid StudentStatusId { get; set; }
    public StudentAcademicRecordRequest AcademicRecord { get; set; } = new();
    public StudentContactRequest Contact { get; set; } = new();
    public StudentAddressRequest Address { get; set; } = new();
}

public sealed class StudentAcademicRecordRequest
{
    public Guid FacultyId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid StudyProgramId { get; set; }
    public Guid StudyCycleId { get; set; }
    public Guid StudyFrequencyId { get; set; }
    public Guid FundingTypeId { get; set; }
    public Guid AcademicYearId { get; set; }
    public Guid StudyYearId { get; set; }
    public Guid GroupId { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
}

public sealed class StudentContactRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
}

public sealed class StudentAddressRequest
{
    public AddressType AddressType { get; set; } = AddressType.Permanent;

    [Required]
    public string Country { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string Street { get; set; } = string.Empty;

    [Required]
    public string PostalCode { get; set; } = string.Empty;
}

public sealed class AddStudentNoteRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;
}

public sealed class ChangeStudentStatusRequest
{
    public Guid StudentStatusId { get; set; }
    public string? Reason { get; set; }
}
