using Archive.Domain.Common;
using Archive.Domain.Enums;

namespace Archive.Domain.Entities;

public sealed class Student : AuditableEntity
{
    public string RegistrationNumber { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
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

    public Faculty? Faculty { get; set; }
    public Department? Department { get; set; }
    public StudyProgram? StudyProgram { get; set; }
    public Group? Group { get; set; }
    public StudentStatus? StudentStatus { get; set; }
    public StudentAcademicRecord? AcademicRecord { get; set; }
    public StudentContact? Contact { get; set; }
    public ICollection<StudentAddress> Addresses { get; set; } = new List<StudentAddress>();
    public ICollection<StudentNote> Notes { get; set; } = new List<StudentNote>();
    public ICollection<StudentStatusHistory> StatusHistory { get; set; } = new List<StudentStatusHistory>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}

public sealed class StudentAcademicRecord : AuditableEntity
{
    public Guid StudentId { get; set; }
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
    public bool IsCurrent { get; set; } = true;

    public Student? Student { get; set; }
    public Faculty? Faculty { get; set; }
    public Department? Department { get; set; }
    public StudyProgram? StudyProgram { get; set; }
    public StudyCycle? StudyCycle { get; set; }
    public StudyFrequency? StudyFrequency { get; set; }
    public FundingType? FundingType { get; set; }
    public AcademicYear? AcademicYear { get; set; }
    public StudyYear? StudyYear { get; set; }
    public Group? Group { get; set; }
}

public sealed class StudentContact : AuditableEntity
{
    public Guid StudentId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }

    public Student? Student { get; set; }
}

public sealed class StudentAddress : AuditableEntity
{
    public Guid StudentId { get; set; }
    public AddressType AddressType { get; set; }
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }

    public Student? Student { get; set; }
}

public sealed class StudentNote : AuditableEntity
{
    public Guid StudentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public Student? Student { get; set; }
}

public sealed class StudentStatusHistory : AuditableEntity
{
    public Guid StudentId { get; set; }
    public Guid? PreviousStatusId { get; set; }
    public Guid NewStatusId { get; set; }
    public string? Reason { get; set; }
    public DateTimeOffset ChangedAt { get; set; } = DateTimeOffset.UtcNow;

    public Student? Student { get; set; }
    public StudentStatus? PreviousStatus { get; set; }
    public StudentStatus? NewStatus { get; set; }
}
