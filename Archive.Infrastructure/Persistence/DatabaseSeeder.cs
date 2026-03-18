using Archive.Application.Abstractions;
using Archive.Application.Common;
using Archive.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ArchiveDbContext dbContext, IPasswordHasher passwordHasher,
        IDateTimeProvider dateTimeProvider, CancellationToken cancellationToken)
    {
        await SeedPermissionsAsync(dbContext, cancellationToken);
        await SeedRolesAndUsersAsync(dbContext, passwordHasher, cancellationToken);
        await SeedNomenclaturesAsync(dbContext, cancellationToken);
        await SeedSampleStudentAsync(dbContext, dateTimeProvider, cancellationToken);
    }

    private static async Task SeedPermissionsAsync(ArchiveDbContext dbContext, CancellationToken cancellationToken)
    {
        var existingCodes =
            await dbContext.Permissions.Select(permission => permission.Code).ToListAsync(cancellationToken);
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

    private static async Task SeedRolesAndUsersAsync(ArchiveDbContext dbContext, IPasswordHasher passwordHasher,
        CancellationToken cancellationToken)
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

        // ================================
        // FACULTĂȚI
        // ================================
        var facultati = new List<Faculty>
        {
            new()
            {
                Code = "FET", Name = "Facultatea Electronică și Telecomunicații",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FEIE", Name = "Facultatea Energetică și Inginerie Electrică",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FCIM", Name = "Facultatea Calculatoare, Informatică și Microelectronică",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FIMIT", Name = "Facultatea Inginerie Mecanică, Industrială și Transporturi",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FTA", Name = "Facultatea Tehnologia Alimentelor",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FUA", Name = "Facultatea Urbanism și Arhitectură",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FCGC", Name = "Facultatea Construcții, Geodezie și Cadastru",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FIEB", Name = "Facultatea Inginerie Economică și Business",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FD", Name = "Facultatea Design",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FSASM", Name = "Facultatea Științe Agricole, Silvice și ale Mediului",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            },
            new()
            {
                Code = "FMV", Name = "Facultatea Medicină Veterinară",
                Description = "Facultate din cadrul Universității Tehnice a Moldovei."
            }
        };

        dbContext.Faculties.AddRange(facultati);

        // ================================
        // CICLURI DE STUDII
        // ================================
        var cicluri = new List<StudyCycle>
        {
            new() { Code = "LIC", Name = "Licență", Description = "Studii superioare de licență." },
            new() { Code = "MAS", Name = "Master", Description = "Studii superioare de master." },
            new() { Code = "DOC", Name = "Doctorat", Description = "Studii superioare de doctorat." }
        };

        dbContext.StudyCycles.AddRange(cicluri);

        // ================================
        // FORME / FRECVENȚE DE STUDIU
        // ================================
        var frecvente = new List<StudyFrequency>
        {
            new() { Code = "IF", Name = "Învățământ cu frecvență", Description = "Studii la zi." },
            new() { Code = "IFR", Name = "Învățământ cu frecvență redusă", Description = "Studii cu frecvență redusă." }
        };

        dbContext.StudyFrequencies.AddRange(frecvente);

        // ================================
        // TIPURI DE FINANȚARE
        // ================================
        var tipuriFinantare = new List<FundingType>
        {
            new() { Code = "BUGET", Name = "Buget", Description = "Loc finanțat de la bugetul de stat." },
            new() { Code = "CONTRACT", Name = "Contract", Description = "Loc cu taxă de studii." }
        };

        dbContext.FundingTypes.AddRange(tipuriFinantare);

        // ================================
        // ANI ACADEMICI
        // ================================
        var aniAcademici = new List<AcademicYear>
        {
            new() { Code = "2024-2025", Name = "2024/2025", StartYear = 2024, EndYear = 2025, IsCurrent = false },
            new() { Code = "2025-2026", Name = "2025/2026", StartYear = 2025, EndYear = 2026, IsCurrent = true }
        };

        dbContext.AcademicYears.AddRange(aniAcademici);

        // ================================
        // ANI DE STUDIU
        // ================================
        var aniStudiu = new List<StudyYear>
        {
            new() { Code = "Y1", Name = "Anul I", YearNumber = 1 },
            new() { Code = "Y2", Name = "Anul II", YearNumber = 2 },
            new() { Code = "Y3", Name = "Anul III", YearNumber = 3 },
            new() { Code = "Y4", Name = "Anul IV", YearNumber = 4 }
        };

        dbContext.StudyYears.AddRange(aniStudiu);

        await dbContext.SaveChangesAsync(cancellationToken);

        // ================================
        // REFERINȚE UZUALE
        // ================================
        var fcim = await dbContext.Faculties.FirstAsync(x => x.Code == "FCIM", cancellationToken);
        var licenta = await dbContext.StudyCycles.FirstAsync(x => x.Code == "LIC", cancellationToken);
        var frecventa = await dbContext.StudyFrequencies.FirstAsync(x => x.Code == "IF", cancellationToken);
        var anAcademicCurent = await dbContext.AcademicYears.FirstAsync(x => x.IsCurrent, cancellationToken);
        var anul1 = await dbContext.StudyYears.FirstAsync(x => x.YearNumber == 1, cancellationToken);

        // ================================
        // DEPARTAMENTE FCIM
        // ================================
        var depIis = new Department
        {
            Code = "IIS",
            Name = "Departamentul Informatică și Ingineria Sistemelor",
            FacultyId = fcim.Id,
            Description = "Departament din cadrul Facultății Calculatoare, Informatică și Microelectronică."
        };

        var depIsa = new Department
        {
            Code = "ISA",
            Name = "Departamentul Ingineria Software și Automatică",
            FacultyId = fcim.Id,
            Description = "Departament din cadrul Facultății Calculatoare, Informatică și Microelectronică."
        };

        var depMib = new Department
        {
            Code = "MIB",
            Name = "Departamentul Microelectronică și Inginerie Biomedicală",
            FacultyId = fcim.Id,
            Description = "Departament din cadrul Facultății Calculatoare, Informatică și Microelectronică."
        };

        var depSsu = new Department
        {
            Code = "SSU",
            Name = "Departamentul Științe Socio-Umane",
            FacultyId = fcim.Id,
            Description = "Departament din cadrul Facultății Calculatoare, Informatică și Microelectronică."
        };

        dbContext.Departments.AddRange(depIis, depIsa, depMib, depSsu);
        await dbContext.SaveChangesAsync(cancellationToken);

        // ================================
        // PROGRAME DE STUDII FCIM
        // ================================
        var programe = new List<StudyProgram>
        {
            new()
            {
                Code = "SD",
                Name = "Știința datelor",
                FacultyId = fcim.Id,
                DepartmentId = depIis.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "AI",
                Name = "Automatică și Informatică",
                FacultyId = fcim.Id,
                DepartmentId = depIsa.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "CR",
                Name = "Calculatoare și rețele",
                FacultyId = fcim.Id,
                DepartmentId = depIis.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "EA",
                Name = "Electronica aplicată",
                FacultyId = fcim.Id,
                DepartmentId = depMib.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "IA",
                Name = "Informatică aplicată",
                FacultyId = fcim.Id,
                DepartmentId = depIis.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "IS",
                Name = "Ingineria software",
                FacultyId = fcim.Id,
                DepartmentId = depIsa.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "IB",
                Name = "Inginerie biomedicală",
                FacultyId = fcim.Id,
                DepartmentId = depMib.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "BIO",
                Name = "Bioinformatică",
                FacultyId = fcim.Id,
                DepartmentId = depIis.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "MN",
                Name = "Microelectronică și nanotehnologii",
                FacultyId = fcim.Id,
                DepartmentId = depMib.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "RM",
                Name = "Robotică și mecatronică",
                FacultyId = fcim.Id,
                DepartmentId = depIsa.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "SI",
                Name = "Securitate informațională",
                FacultyId = fcim.Id,
                DepartmentId = depIis.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            },
            new()
            {
                Code = "TI",
                Name = "Tehnologia informației",
                FacultyId = fcim.Id,
                DepartmentId = depIis.Id,
                StudyCycleId = licenta.Id,
                StudyFrequencyId = frecventa.Id,
                Description = "Program de licență din cadrul FCIM."
            }
        };

        dbContext.StudyPrograms.AddRange(programe);
        await dbContext.SaveChangesAsync(cancellationToken);

        // ================================
        // GRUPE PENTRU ANUL I
        // ================================
        var grupe = programe.Select(program => new Group
        {
            Code = $"{program.Code}-241",
            Name = $"{program.Code}-241",
            StudyProgramId = program.Id,
            AcademicYearId = anAcademicCurent.Id,
            StudyYearId = anul1.Id,
            Description = $"Grupă academică pentru programul {program.Name}."
        }).ToList();

        dbContext.Groups.AddRange(grupe);

        // ================================
        // DISCIPLINE
        // ================================
        var discipline = new List<Subject>
        {
            new() { Code = "AL", Name = "Algebra liniară", DepartmentId = depIis.Id, Credits = 3 },
            new() { Code = "AM", Name = "Analiza matematică", DepartmentId = depIis.Id, Credits = 4 },
            new() { Code = "MD", Name = "Matematică discretă", DepartmentId = depIis.Id, Credits = 5 },

            new() { Code = "PC", Name = "Programarea calculatoarelor", DepartmentId = depIis.Id, Credits = 6 },
            new() { Code = "TP", Name = "Tehnici de programare", DepartmentId = depIis.Id, Credits = 5 },
            new() { Code = "POO", Name = "Programare orientată pe obiecte", DepartmentId = depIsa.Id, Credits = 6 },

            new() { Code = "SDA", Name = "Structuri de date și algoritmi", DepartmentId = depIis.Id, Credits = 5 },
            new() { Code = "APA", Name = "Analiza și proiectarea algoritmilor", DepartmentId = depIis.Id, Credits = 6 },

            new() { Code = "BD", Name = "Baze de date", DepartmentId = depIis.Id, Credits = 6 },
            new() { Code = "SO", Name = "Sisteme de operare", DepartmentId = depIis.Id, Credits = 5 },
            new() { Code = "TWEB", Name = "Tehnologii WEB", DepartmentId = depIis.Id, Credits = 4 },

            new() { Code = "RC", Name = "Rețele de calculatoare", DepartmentId = depIis.Id, Credits = 4 },
            new() { Code = "ARC", Name = "Administrarea rețelelor de calculatoare", DepartmentId = depIis.Id, Credits = 4 },

            new() { Code = "AC", Name = "Arhitecturi de calculatoare", DepartmentId = depIis.Id, Credits = 4 },
            new() { Code = "AMS", Name = "Analiza și modelarea sistemelor", DepartmentId = depIsa.Id, Credits = 6 },

            new() { Code = "LFAF", Name = "Limbaje formale", DepartmentId = depIis.Id, Credits = 5 },
            new() { Code = "AI", Name = "Inteligența artificială", DepartmentId = depIis.Id, Credits = 5 },

            new() { Code = "PSI", Name = "Proiectarea sistemelor informaționale", DepartmentId = depIsa.Id, Credits = 6 },
            new() { Code = "PAD", Name = "Programarea aplicațiilor distribuite", DepartmentId = depIsa.Id, Credits = 5 },
            new() { Code = "ASCS", Name = "Analiza și specificarea cerințelor software", DepartmentId = depIsa.Id, Credits = 3 },
            new() { Code = "TPP", Name = "Testarea produselor program", DepartmentId = depIsa.Id, Credits = 4 },

            new() { Code = "PAM", Name = "Programarea aplicațiilor mobile", DepartmentId = depIis.Id, Credits = 4 },
            new() { Code = "PR", Name = "Programarea în rețea", DepartmentId = depIis.Id, Credits = 4 },

            new() { Code = "PS", Name = "Prelucrarea semnalelor", DepartmentId = depMib.Id, Credits = 3 }
        };

        dbContext.Subjects.AddRange(discipline);

        // ================================
        // STATUSURI STUDENT
        // ================================
        var statusuriStudent = new List<StudentStatus>
        {
            new() { Code = "ACTIV", Name = "Activ", Description = "Student înscris și activ." },
            new() { Code = "ABSOLVENT", Name = "Absolvent", Description = "Student care a finalizat studiile." },
            new() { Code = "EXMATRICULAT", Name = "Exmatriculat", Description = "Student exmatriculat." },
        };

        dbContext.StudentStatuses.AddRange(statusuriStudent);

        // ================================
        // CATEGORII DE DOCUMENTE
        // ================================
        var categoriiDocumente = new List<DocumentCategory>
        {
            new()
            {
                Code = "ACADEMIC",
                Name = "Documente academice",
                Description = "Documente privind activitatea academică a studentului."
            },
            new()
            {
                Code = "ADMIN",
                Name = "Documente administrative",
                Description = "Documente administrative și instituționale."
            },
            new()
            {
                Code = "PERSONAL",
                Name = "Dosar personal student",
                Description = "Documente ce țin de dosarul personal al studentului."
            }
        };

        dbContext.DocumentCategories.AddRange(categoriiDocumente);
        await dbContext.SaveChangesAsync(cancellationToken);

        // ================================
        // TIPURI DE DOCUMENTE
        // ================================
        var categorieAcademica =
            await dbContext.DocumentCategories.FirstAsync(x => x.Code == "ACADEMIC", cancellationToken);
        var categorieAdmin = await dbContext.DocumentCategories.FirstAsync(x => x.Code == "ADMIN", cancellationToken);
        var categoriePersonal =
            await dbContext.DocumentCategories.FirstAsync(x => x.Code == "PERSONAL", cancellationToken);

        var tipuriDocumente = new List<DocumentType>
        {
            new()
            {
                Code = "FOAIE_MATRICOLA",
                Name = "Foaie matricolă",
                Description = "Document academic privind rezultatele studentului.",
                DocumentCategoryId = categorieAcademica.Id
            },
            new()
            {
                Code = "DIPLOMA",
                Name = "Diplomă de studii",
                Description = "Diplomă de absolvire.",
                DocumentCategoryId = categorieAcademica.Id
            },
            new()
            {
                Code = "SUPLIMENT_DIPLOMA",
                Name = "Supliment la diplomă",
                Description = "Supliment descriptiv la diplomă.",
                DocumentCategoryId = categorieAcademica.Id
            },
            new()
            {
                Code = "CONTRACT_STUDII",
                Name = "Contract de studii",
                Description = "Contract privind prestarea serviciilor educaționale.",
                DocumentCategoryId = categorieAdmin.Id
            },
            new()
            {
                Code = "ORDIN",
                Name = "Ordin",
                Description = "Ordin administrativ instituțional.",
                DocumentCategoryId = categorieAdmin.Id
            },
            new()
            {
                Code = "CERERE",
                Name = "Cerere",
                Description = "Cerere depusă de student.",
                DocumentCategoryId = categoriePersonal.Id
            },
            new()
            {
                Code = "COPIE_BULETIN",
                Name = "Copie buletin de identitate",
                Description = "Copie a actului de identitate din dosarul personal.",
                DocumentCategoryId = categoriePersonal.Id
            }
        };

        dbContext.DocumentTypes.AddRange(tipuriDocumente);

        // ================================
        // LOCAȚII DE ARHIVĂ
        // ================================
        var locatiiArhiva = new List<ArchiveLocation>
        {
            new()
            {
                Code = "ARHIVA_CENTRALA",
                Name = "Arhiva centrală UTM",
                Description = "Locația principală pentru păstrarea documentelor arhivate.",
                Room = "Camera 101",
                Shelf = "Raft A"
            },
            new()
            {
                Code = "ARHIVA_FCIM",
                Name = "Arhiva FCIM",
                Description = "Locație dedicată documentelor facultății FCIM.",
                Room = "Camera FCIM-12",
                Shelf = "Raft B"
            }
        };

        dbContext.ArchiveLocations.AddRange(locatiiArhiva);

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedSampleStudentAsync(ArchiveDbContext dbContext, IDateTimeProvider dateTimeProvider,
        CancellationToken cancellationToken)
    {
        if (await dbContext.Students.AnyAsync(cancellationToken))
        {
            return;
        }

        var faculty = await dbContext.Faculties.FirstAsync(cancellationToken);
        var department = await dbContext.Departments.FirstAsync(cancellationToken);
        var program = await dbContext.StudyPrograms.FirstAsync(cancellationToken);
        var group = await dbContext.Groups.FirstAsync(cancellationToken);
        var status =
            await dbContext.StudentStatuses.FirstAsync(studentStatus => studentStatus.Code == "ACTIV",
                cancellationToken);
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