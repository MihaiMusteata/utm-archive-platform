using Archive.Application.Abstractions;
using Archive.Application.Features.Audit;
using Archive.Application.Features.Auth;
using Archive.Application.Features.Dashboard;
using Archive.Application.Features.Documents;
using Archive.Application.Features.Nomenclatures;
using Archive.Application.Features.Roles;
using Archive.Application.Features.Students;
using Archive.Application.Features.Users;
using Archive.Infrastructure.Options;
using Archive.Infrastructure.Persistence;
using Archive.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Archive.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database")
                               ?? throw new InvalidOperationException("Database connection string is missing.");

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));

        services.AddDbContext<ArchiveDbContext>(options =>
            options.UseNpgsql(connectionString, builder => builder.MigrationsAssembly(typeof(ArchiveDbContext).Assembly.FullName)));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUsersService, UsersService>();
        services.AddScoped<IRolesService, RolesService>();
        services.AddScoped<INomenclatureService, NomenclatureService>();
        services.AddScoped<IStudentsService, StudentsService>();
        services.AddScoped<IDocumentsService, DocumentsService>();
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IDashboardService, DashboardService>();

        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
        services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        return services;
    }

    public static async Task InitializeDatabaseAsync(this IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ArchiveDbContext>();
        await dbContext.Database.MigrateAsync(cancellationToken);
        await DatabaseSeeder.SeedAsync(
            dbContext,
            scope.ServiceProvider.GetRequiredService<IPasswordHasher>(),
            scope.ServiceProvider.GetRequiredService<IDateTimeProvider>(),
            cancellationToken);
    }
}
