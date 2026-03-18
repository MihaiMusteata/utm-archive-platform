using Archive.Application.Abstractions;
using System.Security.Claims;

namespace Archive.API.Security;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid? UserId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var userId) ? userId : null;
        }
    }

    public string? Username => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
    public string? IpAddress => httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
    public string? UserAgent => httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString();
    public string? Route => httpContextAccessor.HttpContext?.Items["Archive.Route"]?.ToString() ?? httpContextAccessor.HttpContext?.Request.Path.Value;
    public string? HttpMethod => httpContextAccessor.HttpContext?.Request.Method;
}
