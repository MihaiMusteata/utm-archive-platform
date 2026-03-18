using Archive.Contracts.Common;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public static class QueryPagingExtensions
{
    public static async Task<PagedResponse<TResult>> ToPagedResponseAsync<TSource, TResult>(this IQueryable<TSource> query, int page, int pageSize, Func<TSource, TResult> selector, CancellationToken cancellationToken)
    {
        var sanitizedPage = page < 1 ? 1 : page;
        var sanitizedPageSize = pageSize is < 1 or > 200 ? 20 : pageSize;

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((sanitizedPage - 1) * sanitizedPageSize).Take(sanitizedPageSize).ToListAsync(cancellationToken);

        return new PagedResponse<TResult>
        {
            Items = items.Select(selector).ToList(),
            Page = sanitizedPage,
            PageSize = sanitizedPageSize,
            TotalCount = totalCount
        };
    }

    public static async Task<PagedResponse<T>> ToPagedResponseAsync<T>(this IQueryable<T> query, int page, int pageSize, CancellationToken cancellationToken)
    {
        var sanitizedPage = page < 1 ? 1 : page;
        var sanitizedPageSize = pageSize is < 1 or > 200 ? 20 : pageSize;

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((sanitizedPage - 1) * sanitizedPageSize).Take(sanitizedPageSize).ToListAsync(cancellationToken);

        return new PagedResponse<T>
        {
            Items = items,
            Page = sanitizedPage,
            PageSize = sanitizedPageSize,
            TotalCount = totalCount
        };
    }
}
