namespace Archive.Domain.ValueObjects;

public readonly record struct FileHash(string Value)
{
    public static FileHash FromSha256(string hash) => new(hash);
}
