using Archive.Application.DTOs;
using Archive.Domain.Entities;

namespace Archive.Application.Abstractions;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Username { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
    string? Route { get; }
    string? HttpMethod { get; }
}

public interface IDateTimeProvider
{
    DateTimeOffset UtcNow { get; }
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface ITokenService
{
    AuthTokenDto CreateAccessToken(User user, IReadOnlyCollection<string> roles, IReadOnlyCollection<string> permissions);
    string CreateRefreshToken();
    string HashRefreshToken(string refreshToken);
}

public interface IFileStorageService
{
    Task<StoredFileDto> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken);
    Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken);
}
