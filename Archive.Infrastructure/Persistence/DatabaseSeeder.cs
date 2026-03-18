using Archive.Application.Abstractions;
using Archive.Application.Common;
using Archive.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ArchiveDbContext dbContext, IPasswordHasher passwordHasher, IDateTimeProvider dateTimeProvider, CancellationToken cancellationToken)
    {
        await SeedPermissionsAsync(dbContext, cancellationToken);
        await SeedRolesAndUsersAsync(dbContext, passwordHasher, cancellationToken);
        await SeedNomenclaturesAsync(dbContext, cancellationToken);
        await SeedSampleStudentAsync(dbContext, dateTimeProvider, cancellationToken);
    }

    private static async Task SeedPermissionsAsync(ArchiveDbContext dbContext, CancellationToken cancellationToken)
    {
        var existingCodes = await dbContext.Permissions.Select(permission => permission.Code).ToListAsync(cancellationToken);
        var missingPermissions = PermissionCatalog.All
            .Where(permission => !existingCodes.Contains(permission.Code))
            .Select(permission => new Permission
            {
                Code = permission.Code,
                Name = permission.Name,
                Category = permission.Category,
                Description = permission.Description
            })
            .ToList();

        if (missingPermissions.Count == 0)
        {
            return;
        }

        dbContext.Permissions.AddRange(missingPermissions);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedRolesAndUsersAsync(ArchiveDbContext dbContext, IPasswordHasher passwordHasher, CancellationToken cancellationToken)
    {
        var permissions = await dbContext.Permissions.ToListAsync(cancellationToken);
        var superAdminRole = await dbContext.Roles
            .Include(role => role.RolePermissions)
            .FirstOrDefaultAsync(role => role.Name == "SuperAdmin", cancellationToken);

        if (superAdminRole is null)
        {
            superAdminRole = new Role
            {
                Name = "SuperAdmin",
                Description = "Platform super administrator with unrestricted access.",
                IsSystem = true
            };

            superAdminRole.RolePermissions = permissions
                .Select(permission => new RolePermission
                {
                    PermissionId = permission.Id
                })
                .ToList();

            dbContext.Roles.Add(superAdminRole);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var adminUser = await dbContext.Users
            .Include(user => user.UserRoles)
            .FirstOrDefaultAsync(user => user.Username == "admin", cancellationToken);

        if (adminUser is null)
        {
            adminUser = new User
            {
                Username = "admin",
                Email = "admin@utm.local",
                FirstName = "System",
                LastName = "Administrator",
                PasswordHash = passwordHasher.HashPassword("Admin123!"),
                IsActive = true
            };

            adminUser.UserRoles.Add(new UserRole
            {
                RoleId = superAdminRole.Id
            });

            dbContext.Users.Add(adminUser);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task SeedNomenclaturesAsync(ArchiveDbContext dbContext, CancellationToken cancellationToken)
    {
        if (await dbContext.Faculties.AnyAsync(cancellationToken))
        {
            return;
        }

        var faculty = new Faculty { Code = "FCIM", Name = "Faculty of Computers, Informatics and Microelectronics", Description = "Seed faculty." };
        
        var department = new Department { Code = "CS", Name = "Computer Science", Faculty = faculty, Description = "Seed department." };
        var cycle = new StudyCycle { Code = "LIC", Name = "Bachelor", Description = "Bachelor cycle." };
        var frequency = new StudyFrequency { Code = "FT", Name = "Full-time", Description = "Full-time studies." };
        var funding = new FundingType { Code = "BUDGET", Name = "Budget", Description = "State-funded." };
        var academicYear = new AcademicYear { Code = "2025-2026", Name = "2025/2026", StartYear = 2025, EndYear = 2026, IsCurrent = true };
        var studyYear = new StudyYear { Code = "Y1", Name = "Year 1", YearNumber = 1 };
        var program = new StudyProgram
        {
            Code = "CS-BSC",
            Name = "Computer Science",
            Faculty = faculty,
            Department = department,
            StudyCycle = cycle,
            StudyFrequency = frequency,
            Description = "Computer Science bachelor program."
        };
        var group = new Group
        {
            Code = "CS-241",
            Name = "CS-241",
            StudyProgram = program,
            AcademicYear = academicYear,
            StudyYear = studyYear,
            Description = "Seed academic group."
        };

        dbContext.AddRange(
            faculty,
            department,
            cycle,
            frequency,
            funding,
            academicYear,
            studyYear,
            program,
            group,
            new Subject { Code = "ALG", Name = "Algorithms", Department = department, Credits = 6 },
            new StudentStatus { Code = "ACTIVE", Name = "Active", Description = "Currently enrolled." },
            new StudentStatus { Code = "GRAD", Name = "Graduated", Description = "Graduated." },
            new StudentStatus { Code = "SUSP", Name = "Suspended", Description = "Temporarily suspended." },
            new DocumentCategory { Code = "ACADEMIC", Name = "Academic documents", Description = "Academic archive documents." },
            new ArchiveLocation { Code = "A1", Name = "Main archive", Description = "Main archive room.", Room = "Archive Room 1", Shelf = "Shelf A" });

        await dbContext.SaveChangesAsync(cancellationToken);

        var category = await dbContext.DocumentCategories.FirstAsync(cancellationToken);
        dbContext.DocumentTypes.Add(new DocumentType
        {
            Code = "TRANSCRIPT",
            Name = "Transcript",
            Description = "Official transcript.",
            DocumentCategoryId = category.Id
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedSampleStudentAsync(ArchiveDbContext dbContext, IDateTimeProvider dateTimeProvider, CancellationToken cancellationToken)
    {
        if (await dbContext.Students.AnyAsync(cancellationToken))
        {
            return;
        }

        var faculty = await dbContext.Faculties.FirstAsync(cancellationToken);
        var department = await dbContext.Departments.FirstAsync(cancellationToken);
        var program = await dbContext.StudyPrograms.FirstAsync(cancellationToken);
        var group = await dbContext.Groups.FirstAsync(cancellationToken);
        var status = await dbContext.StudentStatuses.FirstAsync(studentStatus => studentStatus.Code == "ACTIVE", cancellationToken);
        var cycle = await dbContext.StudyCycles.FirstAsync(cancellationToken);
        var frequency = await dbContext.StudyFrequencies.FirstAsync(cancellationToken);
        var funding = await dbContext.FundingTypes.FirstAsync(cancellationToken);
        var academicYear = await dbContext.AcademicYears.FirstAsync(cancellationToken);
        var studyYear = await dbContext.StudyYears.FirstAsync(cancellationToken);

        var student = new Student
        {
            RegistrationNumber = "UTM-2025-0001",
            NationalId = "200000000001",
            FirstName = "Ana",
            LastName = "Popa",
            DateOfBirth = new DateOnly(2005, 2, 15),
            EnrollmentDate = new DateOnly(2025, 9, 1),
            Gender = Domain.Enums.Gender.Female,
            FacultyId = faculty.Id,
            DepartmentId = department.Id,
            StudyProgramId = program.Id,
            GroupId = group.Id,
            StudentStatusId = status.Id,
            Contact = new StudentContact
            {
                Email = "ana.popa@student.utm.md",
                Phone = "+37360000001",
                EmergencyContactName = "Ion Popa",
                EmergencyContactPhone = "+37369000001"
            },
            AcademicRecord = new StudentAcademicRecord
            {
                FacultyId = faculty.Id,
                DepartmentId = department.Id,
                StudyProgramId = program.Id,
                StudyCycleId = cycle.Id,
                StudyFrequencyId = frequency.Id,
                FundingTypeId = funding.Id,
                AcademicYearId = academicYear.Id,
                StudyYearId = studyYear.Id,
                GroupId = group.Id,
                StudentNumber = "24100001",
                IsCurrent = true
            }
        };

        student.Addresses.Add(new StudentAddress
        {
            AddressType = Domain.Enums.AddressType.Permanent,
            Country = "Moldova",
            City = "Chisinau",
            Street = "Studentilor 1",
            PostalCode = "MD-2000",
            IsPrimary = true
        });

        student.StatusHistory.Add(new StudentStatusHistory
        {
            PreviousStatusId = null,
            NewStatusId = status.Id,
            Reason = "Initial enrollment",
            ChangedAt = dateTimeProvider.UtcNow
        });

        student.Notes.Add(new StudentNote
        {
            Title = "Seed note",
            Content = "Initial sample student seeded for MVP validation."
        });

        dbContext.Students.Add(student);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
