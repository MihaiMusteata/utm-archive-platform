using Archive.Application.Common;
using Archive.Application.DTOs;
using Archive.Application.Features.Students;
using Archive.Application.Validation;
using Archive.Contracts.Common;
using Archive.Contracts.Students;
using Archive.Domain.Entities;
using Archive.Domain.ValueObjects;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public sealed class StudentsService(ArchiveDbContext dbContext) : IStudentsService
{
    public async Task<PagedResponse<StudentListItemDto>> GetStudentsAsync(StudentListRequest request, CancellationToken cancellationToken)
    {
        var query = dbContext.Students
            .AsNoTracking()
            .Include(student => student.Faculty)
            .Include(student => student.StudyProgram)
            .Include(student => student.Group)
            .Include(student => student.StudentStatus)
            .Include(student => student.Documents)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(student =>
                student.RegistrationNumber.ToLower().Contains(search) ||
                student.NationalId.ToLower().Contains(search) ||
                student.FirstName.ToLower().Contains(search) ||
                student.LastName.ToLower().Contains(search));
        }

        if (request.FacultyId.HasValue)
        {
            query = query.Where(student => student.FacultyId == request.FacultyId.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            query = query.Where(student => student.DepartmentId == request.DepartmentId.Value);
        }

        if (request.StudyProgramId.HasValue)
        {
            query = query.Where(student => student.StudyProgramId == request.StudyProgramId.Value);
        }

        if (request.GroupId.HasValue)
        {
            query = query.Where(student => student.GroupId == request.GroupId.Value);
        }

        if (request.StudentStatusId.HasValue)
        {
            query = query.Where(student => student.StudentStatusId == request.StudentStatusId.Value);
        }

        return await query.OrderBy(student => student.LastName).ThenBy(student => student.FirstName).ToPagedResponseAsync(request.Page, request.PageSize, student => student.ToListItemDto(), cancellationToken);
    }

    public async Task<StudentDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .AsNoTracking()
            .Include(current => current.StudentStatus)
            .Include(current => current.Contact)
            .Include(current => current.Addresses)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.Faculty)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.Department)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.StudyProgram)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.StudyCycle)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.StudyFrequency)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.FundingType)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.AcademicYear)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.StudyYear)
            .Include(current => current.AcademicRecord)!.ThenInclude(record => record!.Group)
            .Include(current => current.Documents)!.ThenInclude(document => document.DocumentType)
            .Include(current => current.Documents)!.ThenInclude(document => document.DocumentCategory)
            .Include(current => current.Documents)!.ThenInclude(document => document.ArchiveLocation)
            .Include(current => current.StatusHistory)!.ThenInclude(history => history.PreviousStatus)
            .Include(current => current.StatusHistory)!.ThenInclude(history => history.NewStatus)
            .Include(current => current.Notes)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (student is null)
        {
            throw new AppException("Student not found.", 404);
        }

        var address = student.Addresses.OrderByDescending(current => current.IsPrimary).ThenBy(current => current.CreatedAt).FirstOrDefault();
        var noteUsers = await ResolveNoteUsersAsync(student.Notes, cancellationToken);

        return new StudentDetailDto
        {
            Id = student.Id,
            RegistrationNumber = student.RegistrationNumber,
            NationalId = student.NationalId,
            FirstName = student.FirstName,
            LastName = student.LastName,
            MiddleName = student.MiddleName,
            FullName = new PersonName(student.FirstName, student.LastName, student.MiddleName).FullName,
            DateOfBirth = student.DateOfBirth,
            Gender = student.Gender.ToString(),
            EnrollmentDate = student.EnrollmentDate,
            GraduationDate = student.GraduationDate,
            FacultyId = student.FacultyId,
            DepartmentId = student.DepartmentId,
            StudyProgramId = student.StudyProgramId,
            GroupId = student.GroupId,
            StudentStatusId = student.StudentStatusId,
            Status = student.StudentStatus?.Name ?? string.Empty,
            Contact = new StudentContactDto
            {
                Email = student.Contact?.Email ?? string.Empty,
                Phone = student.Contact?.Phone ?? string.Empty,
                EmergencyContactName = student.Contact?.EmergencyContactName,
                EmergencyContactPhone = student.Contact?.EmergencyContactPhone
            },
            Address = new StudentAddressDto
            {
                AddressType = address?.AddressType.ToString() ?? string.Empty,
                Country = address?.Country ?? string.Empty,
                City = address?.City ?? string.Empty,
                Street = address?.Street ?? string.Empty,
                PostalCode = address?.PostalCode ?? string.Empty
            },
            AcademicInfo = new StudentAcademicInfoDto
            {
                FacultyId = student.AcademicRecord?.FacultyId ?? Guid.Empty,
                DepartmentId = student.AcademicRecord?.DepartmentId ?? Guid.Empty,
                StudyProgramId = student.AcademicRecord?.StudyProgramId ?? Guid.Empty,
                StudyCycleId = student.AcademicRecord?.StudyCycleId ?? Guid.Empty,
                StudyFrequencyId = student.AcademicRecord?.StudyFrequencyId ?? Guid.Empty,
                FundingTypeId = student.AcademicRecord?.FundingTypeId ?? Guid.Empty,
                AcademicYearId = student.AcademicRecord?.AcademicYearId ?? Guid.Empty,
                StudyYearId = student.AcademicRecord?.StudyYearId ?? Guid.Empty,
                GroupId = student.AcademicRecord?.GroupId ?? Guid.Empty,
                StudentNumber = student.AcademicRecord?.StudentNumber ?? string.Empty,
                Faculty = student.AcademicRecord?.Faculty?.Name ?? string.Empty,
                Department = student.AcademicRecord?.Department?.Name ?? string.Empty,
                StudyProgram = student.AcademicRecord?.StudyProgram?.Name ?? string.Empty,
                StudyCycle = student.AcademicRecord?.StudyCycle?.Name ?? string.Empty,
                StudyFrequency = student.AcademicRecord?.StudyFrequency?.Name ?? string.Empty,
                FundingType = student.AcademicRecord?.FundingType?.Name ?? string.Empty,
                AcademicYear = student.AcademicRecord?.AcademicYear?.Name ?? string.Empty,
                StudyYear = student.AcademicRecord?.StudyYear?.Name ?? string.Empty,
                Group = student.AcademicRecord?.Group?.Name ?? string.Empty
            },
            Documents = student.Documents.OrderByDescending(document => document.CreatedAt).Select(document => document.ToDto()).ToList(),
            History = student.StatusHistory.OrderByDescending(history => history.ChangedAt).Select(history => new StudentStatusHistoryDto
            {
                Id = history.Id,
                PreviousStatus = history.PreviousStatus?.Name,
                NewStatus = history.NewStatus?.Name ?? string.Empty,
                Reason = history.Reason,
                ChangedAt = history.ChangedAt
            }).ToList(),
            Notes = student.Notes.OrderByDescending(note => note.CreatedAt).Select(note => new StudentNoteDto
            {
                Id = note.Id,
                Title = note.Title,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                CreatedByName = note.CreatedBy.HasValue && noteUsers.TryGetValue(note.CreatedBy.Value, out var userName) ? userName : null
            }).ToList()
        };
    }

    public async Task<StudentDetailDto> CreateAsync(StudentUpsertRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        if (await dbContext.Students.AnyAsync(student => student.RegistrationNumber == request.RegistrationNumber || student.NationalId == request.NationalId, cancellationToken))
        {
            throw new AppException("Student registration number or national ID is already in use.", 409);
        }

        var student = new Student();
        ApplyStudentRequest(student, request);

        student.Contact = new StudentContact();
        ApplyContactRequest(student.Contact, request.Contact);

        var address = new StudentAddress();
        ApplyAddressRequest(address, request.Address);
        address.IsPrimary = true;
        student.Addresses.Add(address);

        student.AcademicRecord = new StudentAcademicRecord();
        ApplyAcademicRecordRequest(student.AcademicRecord, request.AcademicRecord);

        student.StatusHistory.Add(new StudentStatusHistory
        {
            PreviousStatusId = null,
            NewStatusId = request.StudentStatusId,
            Reason = "Initial creation"
        });

        dbContext.Students.Add(student);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(student.Id, cancellationToken);
    }

    public async Task<StudentDetailDto> UpdateAsync(Guid id, StudentUpsertRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        var student = await dbContext.Students
            .Include(current => current.Contact)
            .Include(current => current.Addresses)
            .Include(current => current.AcademicRecord)
            .Include(current => current.StatusHistory)
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (student is null)
        {
            throw new AppException("Student not found.", 404);
        }

        if (await dbContext.Students.AnyAsync(current => current.Id != id && (current.RegistrationNumber == request.RegistrationNumber || current.NationalId == request.NationalId), cancellationToken))
        {
            throw new AppException("Student registration number or national ID is already in use.", 409);
        }

        var previousStatusId = student.StudentStatusId;
        ApplyStudentRequest(student, request);

        if (student.Contact is null)
        {
            student.Contact = new StudentContact();
        }

        ApplyContactRequest(student.Contact, request.Contact);

        var address = student.Addresses.OrderByDescending(current => current.IsPrimary).FirstOrDefault();
        if (address is null)
        {
            address = new StudentAddress { IsPrimary = true };
            student.Addresses.Add(address);
        }

        ApplyAddressRequest(address, request.Address);

        if (student.AcademicRecord is null)
        {
            student.AcademicRecord = new StudentAcademicRecord();
        }

        ApplyAcademicRecordRequest(student.AcademicRecord, request.AcademicRecord);

        if (previousStatusId != request.StudentStatusId)
        {
            student.StatusHistory.Add(new StudentStatusHistory
            {
                PreviousStatusId = previousStatusId,
                NewStatusId = request.StudentStatusId,
                Reason = "Updated from student profile"
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(student.Id, cancellationToken);
    }

    public async Task<StudentNoteDto> AddNoteAsync(Guid studentId, AddStudentNoteRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        var student = await dbContext.Students.Include(current => current.Notes).FirstOrDefaultAsync(current => current.Id == studentId, cancellationToken);
        if (student is null)
        {
            throw new AppException("Student not found.", 404);
        }

        var note = new StudentNote
        {
            StudentId = studentId,
            Title = request.Title.Trim(),
            Content = request.Content.Trim()
        };

        student.Notes.Add(note);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new StudentNoteDto
        {
            Id = note.Id,
            Title = note.Title,
            Content = note.Content,
            CreatedAt = note.CreatedAt
        };
    }

    public async Task<IReadOnlyCollection<StudentStatusHistoryDto>> ChangeStatusAsync(Guid studentId, ChangeStudentStatusRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        var student = await dbContext.Students
            .Include(current => current.StatusHistory)
            .FirstOrDefaultAsync(current => current.Id == studentId, cancellationToken);

        if (student is null)
        {
            throw new AppException("Student not found.", 404);
        }

        var previousStatusId = student.StudentStatusId;
        student.StudentStatusId = request.StudentStatusId;
        student.StatusHistory.Add(new StudentStatusHistory
        {
            StudentId = studentId,
            PreviousStatusId = previousStatusId,
            NewStatusId = request.StudentStatusId,
            Reason = request.Reason
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return await dbContext.StudentStatusHistory
            .AsNoTracking()
            .Where(history => history.StudentId == studentId)
            .Include(history => history.PreviousStatus)
            .Include(history => history.NewStatus)
            .OrderByDescending(history => history.ChangedAt)
            .Select(history => new StudentStatusHistoryDto
            {
                Id = history.Id,
                PreviousStatus = history.PreviousStatus!.Name,
                NewStatus = history.NewStatus!.Name,
                Reason = history.Reason,
                ChangedAt = history.ChangedAt
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<Dictionary<Guid, string>> ResolveNoteUsersAsync(IEnumerable<StudentNote> notes, CancellationToken cancellationToken)
    {
        var userIds = notes.Where(note => note.CreatedBy.HasValue).Select(note => note.CreatedBy!.Value).Distinct().ToList();
        return await dbContext.Users
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id))
            .ToDictionaryAsync(user => user.Id, user => user.Username, cancellationToken);
    }

    private static void ApplyStudentRequest(Student student, StudentUpsertRequest request)
    {
        student.RegistrationNumber = request.RegistrationNumber.Trim();
        student.NationalId = request.NationalId.Trim();
        student.FirstName = request.FirstName.Trim();
        student.LastName = request.LastName.Trim();
        student.MiddleName = request.MiddleName?.Trim();
        student.DateOfBirth = request.DateOfBirth;
        student.Gender = request.Gender;
        student.EnrollmentDate = request.EnrollmentDate;
        student.GraduationDate = request.GraduationDate;
        student.FacultyId = request.FacultyId;
        student.DepartmentId = request.DepartmentId;
        student.StudyProgramId = request.StudyProgramId;
        student.GroupId = request.GroupId;
        student.StudentStatusId = request.StudentStatusId;
    }

    private static void ApplyContactRequest(StudentContact contact, StudentContactRequest request)
    {
        contact.Email = request.Email.Trim();
        contact.Phone = request.Phone.Trim();
        contact.EmergencyContactName = request.EmergencyContactName?.Trim();
        contact.EmergencyContactPhone = request.EmergencyContactPhone?.Trim();
    }

    private static void ApplyAddressRequest(StudentAddress address, StudentAddressRequest request)
    {
        address.AddressType = request.AddressType;
        address.Country = request.Country.Trim();
        address.City = request.City.Trim();
        address.Street = request.Street.Trim();
        address.PostalCode = request.PostalCode.Trim();
    }

    private static void ApplyAcademicRecordRequest(StudentAcademicRecord record, StudentAcademicRecordRequest request)
    {
        record.FacultyId = request.FacultyId;
        record.DepartmentId = request.DepartmentId;
        record.StudyProgramId = request.StudyProgramId;
        record.StudyCycleId = request.StudyCycleId;
        record.StudyFrequencyId = request.StudyFrequencyId;
        record.FundingTypeId = request.FundingTypeId;
        record.AcademicYearId = request.AcademicYearId;
        record.StudyYearId = request.StudyYearId;
        record.GroupId = request.GroupId;
        record.StudentNumber = request.StudentNumber.Trim();
        record.IsCurrent = true;
    }
}
