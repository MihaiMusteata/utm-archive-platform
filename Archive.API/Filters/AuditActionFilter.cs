using Microsoft.AspNetCore.Mvc.Filters;

namespace Archive.API.Filters;

public sealed class AuditActionFilter : IAsyncActionFilter
{
    public Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        context.HttpContext.Items["Archive.Route"] = context.ActionDescriptor.AttributeRouteInfo?.Template ?? context.HttpContext.Request.Path.Value ?? string.Empty;
        return next();
    }
}
