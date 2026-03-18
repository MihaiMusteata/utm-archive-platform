using Archive.API.Security;
using Archive.Application.Features.Students;
using Archive.Contracts.Students;
using Microsoft.AspNetCore.Mvc;

namespace Archive.API.Controllers;

[ApiController]
[Route("api/students")]
public sealed class StudentsController(IStudentsService studentsService) : ControllerBase
{
    [HttpGet]
    [HasPermission("students.view")]
    public async Task<IActionResult> GetStudents([FromQuery] StudentListRequest request, CancellationToken cancellationToken) =>
        Ok(await studentsService.GetStudentsAsync(request, cancellationToken));

    [HttpGet("{id:guid}")]
    [HasPermission("students.view")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await studentsService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [HasPermission("students.create")]
    public async Task<IActionResult> Create([FromBody] StudentUpsertRequest request, CancellationToken cancellationToken) =>
        Ok(await studentsService.CreateAsync(request, cancellationToken));

    [HttpPut("{id:guid}")]
    [HasPermission("students.update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] StudentUpsertRequest request, CancellationToken cancellationToken) =>
        Ok(await studentsService.UpdateAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/notes")]
    [HasPermission("students.notes")]
    public async Task<IActionResult> AddNote(Guid id, [FromBody] AddStudentNoteRequest request, CancellationToken cancellationToken) =>
        Ok(await studentsService.AddNoteAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/status")]
    [HasPermission("students.status")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeStudentStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await studentsService.ChangeStatusAsync(id, request, cancellationToken));
}
