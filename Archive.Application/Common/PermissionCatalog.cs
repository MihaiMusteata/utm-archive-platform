namespace Archive.Application.Common;

public sealed record PermissionDefinition(string Code, string Name, string Category, string Description);

public static class PermissionCatalog
{
    public static readonly IReadOnlyCollection<PermissionDefinition> All = new[]
    {
        new PermissionDefinition("dashboard.view", "View dashboard", "Dashboard", "Access platform summary information."),
        new PermissionDefinition("students.view", "View students", "Students", "Browse and inspect student data."),
        new PermissionDefinition("students.create", "Create students", "Students", "Create student records."),
        new PermissionDefinition("students.update", "Update students", "Students", "Edit student records."),
        new PermissionDefinition("students.notes", "Manage student notes", "Students", "Create student notes."),
        new PermissionDefinition("students.status", "Manage student statuses", "Students", "Update student status history."),
        new PermissionDefinition("documents.view", "View documents", "Documents", "Browse document metadata."),
        new PermissionDefinition("documents.upload", "Upload documents", "Documents", "Upload archive documents."),
        new PermissionDefinition("documents.download", "Download documents", "Documents", "Download stored archive documents."),
        new PermissionDefinition("nomenclatures.view", "View nomenclatures", "Nomenclatures", "Browse nomenclature catalogs."),
        new PermissionDefinition("nomenclatures.manage", "Manage nomenclatures", "Nomenclatures", "Create and update nomenclature catalogs."),
        new PermissionDefinition("users.view", "View users", "Users", "Browse user accounts."),
        new PermissionDefinition("users.manage", "Manage users", "Users", "Create and edit user accounts."),
        new PermissionDefinition("roles.view", "View roles", "Roles", "Browse roles and permissions."),
        new PermissionDefinition("roles.manage", "Manage roles", "Roles", "Create and edit roles."),
        new PermissionDefinition("audit.view", "View audit logs", "Audit", "Browse audit history.")
    };
}
