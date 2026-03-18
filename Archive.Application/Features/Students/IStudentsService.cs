using Archive.Application.DTOs;
using Archive.Contracts.Common;
using Archive.Contracts.Students;

namespace Archive.Application.Features.Students;

public interface IStudentsService
{
    Task<PagedResponse<StudentListItemDto>> GetStudentsAsync(StudentListRequest request, CancellationToken cancellationToken);
    Task<StudentDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<StudentDetailDto> CreateAsync(StudentUpsertRequest request, CancellationToken cancellationToken);
    Task<StudentDetailDto> UpdateAsync(Guid id, StudentUpsertRequest request, CancellationToken cancellationToken);
    Task<StudentNoteDto> AddNoteAsync(Guid studentId, AddStudentNoteRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyCollection<StudentStatusHistoryDto>> ChangeStatusAsync(Guid studentId, ChangeStudentStatusRequest request, CancellationToken cancellationToken);
}
