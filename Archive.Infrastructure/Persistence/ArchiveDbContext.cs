using Archive.Application.Abstractions;
using Archive.Domain.Common;
using Archive.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;

namespace Archive.Infrastructure.Persistence;

public sealed class ArchiveDbContext(
    DbContextOptions<ArchiveDbContext> options,
    ICurrentUserService currentUserService,
    IDateTimeProvider dateTimeProvider) : DbContext(options)
{
    private bool _savingAudit;

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Faculty> Faculties => Set<Faculty>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<StudyProgram> StudyPrograms => Set<StudyProgram>();
    public DbSet<StudyCycle> StudyCycles => Set<StudyCycle>();
    public DbSet<StudyFrequency> StudyFrequencies => Set<StudyFrequency>();
    public DbSet<FundingType> FundingTypes => Set<FundingType>();
    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<StudyYear> StudyYears => Set<StudyYear>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<StudentStatus> StudentStatuses => Set<StudentStatus>();
    public DbSet<DocumentType> DocumentTypes => Set<DocumentType>();
    public DbSet<DocumentCategory> DocumentCategories => Set<DocumentCategory>();
    public DbSet<ArchiveLocation> ArchiveLocations => Set<ArchiveLocation>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<StudentAcademicRecord> StudentAcademicRecords => Set<StudentAcademicRecord>();
    public DbSet<StudentContact> StudentContacts => Set<StudentContact>();
    public DbSet<StudentAddress> StudentAddresses => Set<StudentAddress>();
    public DbSet<StudentNote> StudentNotes => Set<StudentNote>();
    public DbSet<StudentStatusHistory> StudentStatusHistory => Set<StudentStatusHistory>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentVersion> DocumentVersions => Set<DocumentVersion>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureUser(modelBuilder);
        ConfigureNomenclatures(modelBuilder);
        ConfigureStudents(modelBuilder);
        ConfigureDocuments(modelBuilder);
        ConfigureAudit(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        if (_savingAudit)
        {
            return await base.SaveChangesAsync(cancellationToken);
        }

        var now = dateTimeProvider.UtcNow;
        var actorId = currentUserService.UserId;
        var auditLogs = new List<AuditLog>();

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
                entry.Entity.CreatedBy ??= actorId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        foreach (var entry in ChangeTracker.Entries().Where(static e =>
                     e.Entity is AuditableEntity &&
                     e.Entity is not AuditLog &&
                     e.Entity is not RefreshToken &&
                     e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            auditLogs.Add(BuildAuditLog(entry, actorId, now));
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        if (auditLogs.Count > 0)
        {
            _savingAudit = true;
            AuditLogs.AddRange(auditLogs);
            await base.SaveChangesAsync(cancellationToken);
            _savingAudit = false;
        }

        return result;
    }

    private AuditLog BuildAuditLog(EntityEntry entry, Guid? actorId, DateTimeOffset timestamp)
    {
        var details = new Dictionary<string, object?>();
        foreach (var property in entry.Properties.Where(static property => property.Metadata.Name is not nameof(AuditableEntity.CreatedAt) and not nameof(AuditableEntity.UpdatedAt)))
        {
            if (entry.State == EntityState.Added)
            {
                details[property.Metadata.Name] = property.CurrentValue;
            }
            else if (entry.State == EntityState.Deleted)
            {
                details[property.Metadata.Name] = property.OriginalValue;
            }
            else if (property.IsModified)
            {
                details[property.Metadata.Name] = new
                {
                    Old = property.OriginalValue,
                    New = property.CurrentValue
                };
            }
        }

        return new AuditLog
        {
            ActorUserId = actorId,
            Action = entry.State.ToString().ToUpperInvariant(),
            EntityName = entry.Metadata.ClrType.Name,
            EntityId = (entry.Entity as Entity)?.Id.ToString(),
            Route = currentUserService.Route,
            Method = currentUserService.HttpMethod,
            IpAddress = currentUserService.IpAddress,
            UserAgent = currentUserService.UserAgent,
            DetailsJson = JsonSerializer.Serialize(details),
            CreatedAt = timestamp,
            UpdatedAt = timestamp,
            CreatedBy = actorId
        };
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(user => user.Username).IsUnique();
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Username).HasMaxLength(100);
            entity.Property(user => user.Email).HasMaxLength(150);
            entity.Property(user => user.FirstName).HasMaxLength(100);
            entity.Property(user => user.LastName).HasMaxLength(100);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("roles");
            entity.HasIndex(role => role.Name).IsUnique();
            entity.Property(role => role.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("permissions");
            entity.HasIndex(permission => permission.Code).IsUnique();
            entity.Property(permission => permission.Code).HasMaxLength(120);
            entity.Property(permission => permission.Category).HasMaxLength(100);
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            entity.HasIndex(userRole => new { userRole.UserId, userRole.RoleId }).IsUnique();
            entity.HasOne(userRole => userRole.User).WithMany(user => user.UserRoles).HasForeignKey(userRole => userRole.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(userRole => userRole.Role).WithMany(role => role.UserRoles).HasForeignKey(userRole => userRole.RoleId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RolePermission>(entity =>
        {
            entity.ToTable("role_permissions");
            entity.HasIndex(rolePermission => new { rolePermission.RoleId, rolePermission.PermissionId }).IsUnique();
            entity.HasOne(rolePermission => rolePermission.Role).WithMany(role => role.RolePermissions).HasForeignKey(rolePermission => rolePermission.RoleId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(rolePermission => rolePermission.Permission).WithMany(permission => permission.RolePermissions).HasForeignKey(rolePermission => rolePermission.PermissionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens");
            entity.HasIndex(refreshToken => refreshToken.TokenHash).IsUnique();
            entity.HasOne(refreshToken => refreshToken.User).WithMany(user => user.RefreshTokens).HasForeignKey(refreshToken => refreshToken.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureNomenclatures(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.ToTable("faculties");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.ToTable("departments");
            entity.HasIndex(item => item.Code).IsUnique();
            entity.HasOne(item => item.Faculty).WithMany(faculty => faculty.Departments).HasForeignKey(item => item.FacultyId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StudyCycle>(entity =>
        {
            entity.ToTable("study_cycles");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<StudyFrequency>(entity =>
        {
            entity.ToTable("study_frequencies");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<FundingType>(entity =>
        {
            entity.ToTable("funding_types");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<AcademicYear>(entity =>
        {
            entity.ToTable("academic_years");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<StudyYear>(entity =>
        {
            entity.ToTable("study_years");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<StudyProgram>(entity =>
        {
            entity.ToTable("study_programs");
            entity.HasIndex(item => item.Code).IsUnique();
            entity.HasOne(item => item.Faculty).WithMany(faculty => faculty.StudyPrograms).HasForeignKey(item => item.FacultyId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.Department).WithMany(department => department.StudyPrograms).HasForeignKey(item => item.DepartmentId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.StudyCycle).WithMany(studyCycle => studyCycle.StudyPrograms).HasForeignKey(item => item.StudyCycleId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.StudyFrequency).WithMany(studyFrequency => studyFrequency.StudyPrograms).HasForeignKey(item => item.StudyFrequencyId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.ToTable("groups");
            entity.HasIndex(item => item.Code).IsUnique();
            entity.HasOne(item => item.StudyProgram).WithMany(studyProgram => studyProgram.Groups).HasForeignKey(item => item.StudyProgramId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.AcademicYear).WithMany(academicYear => academicYear.Groups).HasForeignKey(item => item.AcademicYearId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(item => item.StudyYear).WithMany(studyYear => studyYear.Groups).HasForeignKey(item => item.StudyYearId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.ToTable("subjects");
            entity.HasIndex(item => item.Code).IsUnique();
            entity.HasOne(item => item.Department).WithMany(department => department.Subjects).HasForeignKey(item => item.DepartmentId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StudentStatus>(entity =>
        {
            entity.ToTable("student_statuses");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<DocumentCategory>(entity =>
        {
            entity.ToTable("document_categories");
            entity.HasIndex(item => item.Code).IsUnique();
        });

        modelBuilder.Entity<DocumentType>(entity =>
        {
            entity.ToTable("document_types");
            entity.HasIndex(item => item.Code).IsUnique();
            entity.HasOne(item => item.DocumentCategory).WithMany(documentCategory => documentCategory.DocumentTypes).HasForeignKey(item => item.DocumentCategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ArchiveLocation>(entity =>
        {
            entity.ToTable("archive_locations");
            entity.HasIndex(item => item.Code).IsUnique();
        });
    }

    private static void ConfigureStudents(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(entity =>
        {
            entity.ToTable("students");
            entity.HasIndex(student => student.RegistrationNumber).IsUnique();
            entity.HasIndex(student => student.NationalId).IsUnique();
            entity.HasOne(student => student.Faculty).WithMany(faculty => faculty.Students).HasForeignKey(student => student.FacultyId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(student => student.Department).WithMany(department => department.Students).HasForeignKey(student => student.DepartmentId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(student => student.StudyProgram).WithMany(studyProgram => studyProgram.Students).HasForeignKey(student => student.StudyProgramId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(student => student.Group).WithMany(group => group.Students).HasForeignKey(student => student.GroupId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(student => student.StudentStatus).WithMany(status => status.Students).HasForeignKey(student => student.StudentStatusId).OnDelete(DeleteBehavior.Restrict);
            entity.Property(student => student.FirstName).HasMaxLength(100);
            entity.Property(student => student.LastName).HasMaxLength(100);
            entity.Property(student => student.NationalId).HasMaxLength(50);
        });

        modelBuilder.Entity<StudentAcademicRecord>(entity =>
        {
            entity.ToTable("student_academic_records");
            entity.HasIndex(record => record.StudentId).IsUnique();
            entity.HasOne(record => record.Student).WithOne(student => student.AcademicRecord).HasForeignKey<StudentAcademicRecord>(record => record.StudentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(record => record.Faculty).WithMany().HasForeignKey(record => record.FacultyId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.Department).WithMany().HasForeignKey(record => record.DepartmentId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.StudyProgram).WithMany().HasForeignKey(record => record.StudyProgramId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.StudyCycle).WithMany().HasForeignKey(record => record.StudyCycleId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.StudyFrequency).WithMany().HasForeignKey(record => record.StudyFrequencyId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.FundingType).WithMany(fundingType => fundingType.StudentAcademicRecords).HasForeignKey(record => record.FundingTypeId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.AcademicYear).WithMany(academicYear => academicYear.StudentAcademicRecords).HasForeignKey(record => record.AcademicYearId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.StudyYear).WithMany(studyYear => studyYear.StudentAcademicRecords).HasForeignKey(record => record.StudyYearId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(record => record.Group).WithMany(group => group.StudentAcademicRecords).HasForeignKey(record => record.GroupId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StudentContact>(entity =>
        {
            entity.ToTable("student_contacts");
            entity.HasIndex(contact => contact.StudentId).IsUnique();
            entity.HasOne(contact => contact.Student).WithOne(student => student.Contact).HasForeignKey<StudentContact>(contact => contact.StudentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StudentAddress>(entity =>
        {
            entity.ToTable("student_addresses");
            entity.HasOne(address => address.Student).WithMany(student => student.Addresses).HasForeignKey(address => address.StudentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StudentNote>(entity =>
        {
            entity.ToTable("student_notes");
            entity.HasOne(note => note.Student).WithMany(student => student.Notes).HasForeignKey(note => note.StudentId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StudentStatusHistory>(entity =>
        {
            entity.ToTable("student_status_history");
            entity.HasOne(history => history.Student).WithMany(student => student.StatusHistory).HasForeignKey(history => history.StudentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(history => history.PreviousStatus).WithMany().HasForeignKey(history => history.PreviousStatusId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(history => history.NewStatus).WithMany(status => status.StatusChanges).HasForeignKey(history => history.NewStatusId).OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureDocuments(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Document>(entity =>
        {
            entity.ToTable("documents");
            entity.HasOne(document => document.Student).WithMany(student => student.Documents).HasForeignKey(document => document.StudentId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(document => document.DocumentType).WithMany(documentType => documentType.Documents).HasForeignKey(document => document.DocumentTypeId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(document => document.DocumentCategory).WithMany(documentCategory => documentCategory.Documents).HasForeignKey(document => document.DocumentCategoryId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(document => document.ArchiveLocation).WithMany(location => location.Documents).HasForeignKey(document => document.ArchiveLocationId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DocumentVersion>(entity =>
        {
            entity.ToTable("document_versions");
            entity.HasIndex(version => new { version.DocumentId, version.VersionNumber }).IsUnique();
            entity.HasOne(version => version.Document).WithMany(document => document.Versions).HasForeignKey(version => version.DocumentId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureAudit(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasOne(auditLog => auditLog.ActorUser).WithMany().HasForeignKey(auditLog => auditLog.ActorUserId).OnDelete(DeleteBehavior.SetNull);
            entity.Property(auditLog => auditLog.Action).HasMaxLength(40);
            entity.Property(auditLog => auditLog.EntityName).HasMaxLength(120);
            entity.Property(auditLog => auditLog.Route).HasMaxLength(250);
            entity.Property(auditLog => auditLog.Method).HasMaxLength(10);
            entity.Property(auditLog => auditLog.IpAddress).HasMaxLength(100);
        });
    }
}
