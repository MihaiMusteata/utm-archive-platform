namespace Archive.Application.DTOs;

public sealed class StudentListItemDto
{
    public Guid Id { get; init; }
    public string RegistrationNumber { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string NationalId { get; init; } = string.Empty;
    public string Faculty { get; init; } = string.Empty;
    public string Program { get; init; } = string.Empty;
    public string Group { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int DocumentsCount { get; init; }
}

public sealed class StudentContactDto
{
    public string Email { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactPhone { get; init; }
}

public sealed class StudentAddressDto
{
    public string AddressType { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string Street { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
}

public sealed class StudentAcademicInfoDto
{
    public Guid FacultyId { get; init; }
    public Guid DepartmentId { get; init; }
    public Guid StudyProgramId { get; init; }
    public Guid StudyCycleId { get; init; }
    public Guid StudyFrequencyId { get; init; }
    public Guid FundingTypeId { get; init; }
    public Guid AcademicYearId { get; init; }
    public Guid StudyYearId { get; init; }
    public Guid GroupId { get; init; }
    public string StudentNumber { get; init; } = string.Empty;
    public string Faculty { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public string StudyProgram { get; init; } = string.Empty;
    public string StudyCycle { get; init; } = string.Empty;
    public string StudyFrequency { get; init; } = string.Empty;
    public string FundingType { get; init; } = string.Empty;
    public string AcademicYear { get; init; } = string.Empty;
    public string StudyYear { get; init; } = string.Empty;
    public string Group { get; init; } = string.Empty;
}

public sealed class StudentNoteDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public DateTimeOffset CreatedAt { get; init; }
    public string? CreatedByName { get; init; }
}

public sealed class StudentStatusHistoryDto
{
    public Guid Id { get; init; }
    public string? PreviousStatus { get; init; }
    public string NewStatus { get; init; } = string.Empty;
    public string? Reason { get; init; }
    public DateTimeOffset ChangedAt { get; init; }
}

public sealed class StudentDetailDto
{
    public Guid Id { get; init; }
    public string RegistrationNumber { get; init; } = string.Empty;
    public string NationalId { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string FullName { get; init; } = string.Empty;
    public DateOnly DateOfBirth { get; init; }
    public string Gender { get; init; } = string.Empty;
    public DateOnly EnrollmentDate { get; init; }
    public DateOnly? GraduationDate { get; init; }
    public Guid FacultyId { get; init; }
    public Guid DepartmentId { get; init; }
    public Guid StudyProgramId { get; init; }
    public Guid GroupId { get; init; }
    public Guid StudentStatusId { get; init; }
    public string Status { get; init; } = string.Empty;
    public StudentContactDto Contact { get; init; } = new();
    public StudentAddressDto Address { get; init; } = new();
    public StudentAcademicInfoDto AcademicInfo { get; init; } = new();
    public IReadOnlyCollection<DocumentDto> Documents { get; init; } = Array.Empty<DocumentDto>();
    public IReadOnlyCollection<StudentStatusHistoryDto> History { get; init; } = Array.Empty<StudentStatusHistoryDto>();
    public IReadOnlyCollection<StudentNoteDto> Notes { get; init; } = Array.Empty<StudentNoteDto>();
}
