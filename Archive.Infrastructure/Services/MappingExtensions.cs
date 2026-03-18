using Archive.Application.DTOs;
using Archive.Domain.Entities;
using Archive.Domain.ValueObjects;
using System.Text.Json;

namespace Archive.Infrastructure.Services;

public static class MappingExtensions
{
    public static CurrentUserDto ToCurrentUserDto(this User user, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> permissions)
    {
        var fullName = new PersonName(user.FirstName, user.LastName).FullName;
        return new CurrentUserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = fullName,
            Roles = roles,
            Permissions = permissions
        };
    }

    public static RoleDto ToDto(this Role role) =>
        new()
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            IsSystem = role.IsSystem,
            PermissionIds = role.RolePermissions.Select(rolePermission => rolePermission.PermissionId).ToArray(),
            PermissionCodes = role.RolePermissions.Select(rolePermission => rolePermission.Permission!.Code).OrderBy(static code => code).ToArray()
        };

    public static PermissionDto ToDto(this Permission permission) =>
        new()
        {
            Id = permission.Id,
            Code = permission.Code,
            Name = permission.Name,
            Category = permission.Category,
            Description = permission.Description
        };

    public static UserDto ToDto(this User user) =>
        new()
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            IsActive = user.IsActive,
            RoleIds = user.UserRoles.Select(userRole => userRole.RoleId).ToArray(),
            Roles = user.UserRoles.Select(userRole => userRole.Role!.Name).OrderBy(static name => name).ToArray()
        };

    public static DocumentDto ToDto(this Document document) =>
        new()
        {
            Id = document.Id,
            StudentId = document.StudentId,
            StudentName = document.Student is null ? string.Empty : new PersonName(document.Student.FirstName, document.Student.LastName, document.Student.MiddleName).FullName,
            Title = document.Title,
            Description = document.Description,
            FileName = document.FileName,
            MimeType = document.MimeType,
            Size = document.Size,
            DocumentType = document.DocumentType?.Name ?? string.Empty,
            DocumentCategory = document.DocumentCategory?.Name ?? string.Empty,
            ArchiveLocation = document.ArchiveLocation?.Name,
            Hash = document.Hash,
            CreatedAt = document.CreatedAt
        };

    public static StudentListItemDto ToListItemDto(this Student student) =>
        new()
        {
            Id = student.Id,
            RegistrationNumber = student.RegistrationNumber,
            NationalId = student.NationalId,
            FullName = new PersonName(student.FirstName, student.LastName, student.MiddleName).FullName,
            Faculty = student.Faculty?.Name ?? string.Empty,
            Program = student.StudyProgram?.Name ?? string.Empty,
            Group = student.Group?.Name ?? string.Empty,
            Status = student.StudentStatus?.Name ?? string.Empty,
            DocumentsCount = student.Documents.Count
        };

    public static AuditLogDto ToDto(this AuditLog auditLog) =>
        new()
        {
            Id = auditLog.Id,
            Action = auditLog.Action,
            EntityName = auditLog.EntityName,
            EntityId = auditLog.EntityId,
            Username = auditLog.ActorUser?.Username,
            Route = auditLog.Route,
            Method = auditLog.Method,
            IpAddress = auditLog.IpAddress,
            DetailsJson = PrettyJson(auditLog.DetailsJson),
            CreatedAt = auditLog.CreatedAt
        };

    private static string? PrettyJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return json;
        }

        using var document = JsonDocument.Parse(json);
        return JsonSerializer.Serialize(document.RootElement, new JsonSerializerOptions { WriteIndented = true });
    }
}
