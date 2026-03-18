namespace Archive.Application.Common;

public sealed class AppException : Exception
{
    public AppException(string message, int statusCode = 400, IDictionary<string, string[]>? errors = null) : base(message)
    {
        StatusCode = statusCode;
        Errors = errors;
    }

    public int StatusCode { get; }
    public IDictionary<string, string[]>? Errors { get; }
}
