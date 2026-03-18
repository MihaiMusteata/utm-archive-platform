using Archive.Contracts.Auth;
using Archive.Contracts.Documents;
using Archive.Contracts.Nomenclatures;
using Archive.Contracts.Roles;
using Archive.Contracts.Students;
using Archive.Contracts.Users;

namespace Archive.Application.Validation;

public static class FeatureValidators
{
    public static void Validate(LoginRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.Username, nameof(request.Username));
        ValidationExtensions.EnsureNotBlank(request.Password, nameof(request.Password));
    }

    public static void Validate(CreateUserRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.Username, nameof(request.Username));
        ValidationExtensions.EnsureNotBlank(request.Password, nameof(request.Password));
        ValidationExtensions.EnsureNotBlank(request.Email, nameof(request.Email));
    }

    public static void Validate(UpdateUserRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.Email, nameof(request.Email));
        ValidationExtensions.EnsureNotBlank(request.FirstName, nameof(request.FirstName));
        ValidationExtensions.EnsureNotBlank(request.LastName, nameof(request.LastName));
    }

    public static void Validate(CreateRoleRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.Name, nameof(request.Name));
        ValidationExtensions.EnsureNotBlank(request.Description, nameof(request.Description));
    }

    public static void Validate(UpdateRoleRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.Description, nameof(request.Description));
    }

    public static void Validate(StudentUpsertRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.RegistrationNumber, nameof(request.RegistrationNumber));
        ValidationExtensions.EnsureNotBlank(request.NationalId, nameof(request.NationalId));
        ValidationExtensions.EnsureNotBlank(request.FirstName, nameof(request.FirstName));
        ValidationExtensions.EnsureNotBlank(request.LastName, nameof(request.LastName));
        ValidationExtensions.EnsureNotEmpty(request.FacultyId, nameof(request.FacultyId));
        ValidationExtensions.EnsureNotEmpty(request.DepartmentId, nameof(request.DepartmentId));
        ValidationExtensions.EnsureNotEmpty(request.StudyProgramId, nameof(request.StudyProgramId));
        ValidationExtensions.EnsureNotEmpty(request.GroupId, nameof(request.GroupId));
        ValidationExtensions.EnsureNotEmpty(request.StudentStatusId, nameof(request.StudentStatusId));
        ValidationExtensions.EnsureNotBlank(request.Contact.Email, nameof(request.Contact.Email));
        ValidationExtensions.EnsureNotBlank(request.Contact.Phone, nameof(request.Contact.Phone));
    }

    public static void Validate(AddStudentNoteRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.Title, nameof(request.Title));
        ValidationExtensions.EnsureNotBlank(request.Content, nameof(request.Content));
    }

    public static void Validate(ChangeStudentStatusRequest request) =>
        ValidationExtensions.EnsureNotEmpty(request.StudentStatusId, nameof(request.StudentStatusId));

    public static void Validate(UploadDocumentRequest request)
    {
        ValidationExtensions.EnsureNotEmpty(request.StudentId, nameof(request.StudentId));
        ValidationExtensions.EnsureNotEmpty(request.DocumentTypeId, nameof(request.DocumentTypeId));
        ValidationExtensions.EnsureNotBlank(request.Title, nameof(request.Title));
        ValidationExtensions.Ensure(request.File is not null && request.File.Length > 0, "File is required.", nameof(request.File));
    }

    public static void Validate(UpsertNomenclatureItemRequest request)
    {
        ValidationExtensions.EnsureNotBlank(request.Code, nameof(request.Code));
        ValidationExtensions.EnsureNotBlank(request.Name, nameof(request.Name));
    }
}
