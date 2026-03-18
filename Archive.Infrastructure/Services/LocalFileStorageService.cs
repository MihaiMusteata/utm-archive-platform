using Archive.Application.Abstractions;
using Archive.Application.DTOs;
using Archive.Infrastructure.Options;
using Microsoft.Extensions.Options;
using System.Buffers;
using System.Security.Cryptography;

namespace Archive.Infrastructure.Services;

public sealed class LocalFileStorageService(IOptions<StorageOptions> options) : IFileStorageService
{
    private readonly string _rootPath = Path.GetFullPath(options.Value.RootPath);

    public async Task<StoredFileDto> SaveAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(_rootPath);

        var extension = Path.GetExtension(fileName);
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var directory = Path.Combine(_rootPath, DateTime.UtcNow.ToString("yyyy"), DateTime.UtcNow.ToString("MM"));
        Directory.CreateDirectory(directory);

        var fullPath = Path.Combine(directory, storedFileName);
        var relativePath = Path.GetRelativePath(_rootPath, fullPath).Replace('\\', '/');

        await using var output = File.Create(fullPath);
        using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);

        var buffer = ArrayPool<byte>.Shared.Rent(1024 * 80);
        long size = 0;

        try
        {
            int bytesRead;
            while ((bytesRead = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken)) > 0)
            {
                await output.WriteAsync(buffer.AsMemory(0, bytesRead), cancellationToken);
                hash.AppendData(buffer, 0, bytesRead);
                size += bytesRead;
            }
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }

        return new StoredFileDto
        {
            FileName = fileName,
            StoredFileName = storedFileName,
            StoragePath = relativePath,
            Size = size,
            MimeType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType,
            Hash = Convert.ToHexString(hash.GetHashAndReset()).ToLowerInvariant()
        };
    }

    public Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var sanitizedPath = storagePath.Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(_rootPath, sanitizedPath);
        Stream stream = File.OpenRead(fullPath);
        return Task.FromResult(stream);
    }
}
