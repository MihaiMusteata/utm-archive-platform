using Archive.Application.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Archive.Infrastructure.Persistence;

public sealed class ArchiveDbContextFactory : IDesignTimeDbContextFactory<ArchiveDbContext>
{
    public ArchiveDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ArchiveDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=utm_archive;Username=postgres;Password=postgres");
        return new ArchiveDbContext(optionsBuilder.Options, new DesignTimeCurrentUserService(), new DesignTimeDateTimeProvider());
    }

    private sealed class DesignTimeCurrentUserService : ICurrentUserService
    {
        public Guid? UserId => null;
        public string? Username => "system";
        public string? IpAddress => null;
        public string? UserAgent => null;
        public string? Route => null;
        public string? HttpMethod => null;
    }

    private sealed class DesignTimeDateTimeProvider : IDateTimeProvider
    {
        public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
    }
}
