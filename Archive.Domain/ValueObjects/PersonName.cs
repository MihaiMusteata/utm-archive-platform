namespace Archive.Domain.ValueObjects;

public readonly record struct PersonName(string FirstName, string LastName, string? MiddleName = null)
{
    public string FullName => string.Join(' ', new[] { FirstName, MiddleName, LastName }.Where(static value => !string.IsNullOrWhiteSpace(value)));
}
