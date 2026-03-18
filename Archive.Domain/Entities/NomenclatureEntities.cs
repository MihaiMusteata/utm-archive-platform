using Archive.Domain.Common;

namespace Archive.Domain.Entities;

public sealed class Faculty : NomenclatureEntity
{
    public ICollection<Department> Departments { get; set; } = new List<Department>();
    public ICollection<StudyProgram> StudyPrograms { get; set; } = new List<StudyProgram>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
}

public sealed class Department : NomenclatureEntity
{
    public Guid FacultyId { get; set; }

    public Faculty? Faculty { get; set; }
    public ICollection<StudyProgram> StudyPrograms { get; set; } = new List<StudyProgram>();
    public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
}

public sealed class StudyCycle : NomenclatureEntity
{
    public ICollection<StudyProgram> StudyPrograms { get; set; } = new List<StudyProgram>();
}

public sealed class StudyFrequency : NomenclatureEntity
{
    public ICollection<StudyProgram> StudyPrograms { get; set; } = new List<StudyProgram>();
}

public sealed class FundingType : NomenclatureEntity
{
    public ICollection<StudentAcademicRecord> StudentAcademicRecords { get; set; } = new List<StudentAcademicRecord>();
}

public sealed class AcademicYear : NomenclatureEntity
{
    public int StartYear { get; set; }
    public int EndYear { get; set; }
    public bool IsCurrent { get; set; }

    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<StudentAcademicRecord> StudentAcademicRecords { get; set; } = new List<StudentAcademicRecord>();
}

public sealed class StudyYear : NomenclatureEntity
{
    public int YearNumber { get; set; }

    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<StudentAcademicRecord> StudentAcademicRecords { get; set; } = new List<StudentAcademicRecord>();
}

public sealed class StudyProgram : NomenclatureEntity
{
    public Guid FacultyId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid StudyCycleId { get; set; }
    public Guid StudyFrequencyId { get; set; }

    public Faculty? Faculty { get; set; }
    public Department? Department { get; set; }
    public StudyCycle? StudyCycle { get; set; }
    public StudyFrequency? StudyFrequency { get; set; }
    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
}

public sealed class Group : NomenclatureEntity
{
    public Guid StudyProgramId { get; set; }
    public Guid AcademicYearId { get; set; }
    public Guid StudyYearId { get; set; }

    public StudyProgram? StudyProgram { get; set; }
    public AcademicYear? AcademicYear { get; set; }
    public StudyYear? StudyYear { get; set; }
    public ICollection<StudentAcademicRecord> StudentAcademicRecords { get; set; } = new List<StudentAcademicRecord>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
}

public sealed class Subject : NomenclatureEntity
{
    public Guid DepartmentId { get; set; }
    public int Credits { get; set; }

    public Department? Department { get; set; }
}

public sealed class StudentStatus : NomenclatureEntity
{
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<StudentStatusHistory> StatusChanges { get; set; } = new List<StudentStatusHistory>();
}

public sealed class DocumentCategory : NomenclatureEntity
{
    public ICollection<DocumentType> DocumentTypes { get; set; } = new List<DocumentType>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}

public sealed class DocumentType : NomenclatureEntity
{
    public Guid DocumentCategoryId { get; set; }

    public DocumentCategory? DocumentCategory { get; set; }
    public ICollection<Document> Documents { get; set; } = new List<Document>();
}

public sealed class ArchiveLocation : NomenclatureEntity
{
    public string? Room { get; set; }
    public string? Shelf { get; set; }

    public ICollection<Document> Documents { get; set; } = new List<Document>();
}
