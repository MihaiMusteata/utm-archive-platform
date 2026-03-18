using Archive.Application.Common;

namespace Archive.Application.Validation;

public static class ValidationExtensions
{
    public static void Ensure(bool condition, string message, string field)
    {
        if (!condition)
        {
            throw new AppException("Validation failed.", 400, new Dictionary<string, string[]>
            {
                [field] = new[] { message }
            });
        }
    }

    public static void EnsureNotEmpty(Guid value, string field) =>
        Ensure(value != Guid.Empty, $"{field} is required.", field);

    public static void EnsureNotBlank(string? value, string field) =>
        Ensure(!string.IsNullOrWhiteSpace(value), $"{field} is required.", field);
}
