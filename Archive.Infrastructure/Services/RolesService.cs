using Archive.Application.Common;
using Archive.Application.DTOs;
using Archive.Application.Features.Roles;
using Archive.Application.Validation;
using Archive.Contracts.Common;
using Archive.Contracts.Roles;
using Archive.Domain.Entities;
using Archive.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Archive.Infrastructure.Services;

public sealed class RolesService(ArchiveDbContext dbContext) : IRolesService
{
    public async Task<PagedResponse<RoleDto>> GetRolesAsync(RoleListRequest request, CancellationToken cancellationToken)
    {
        var query = dbContext.Roles
            .AsNoTracking()
            .Include(role => role.RolePermissions)
                .ThenInclude(rolePermission => rolePermission.Permission)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(role => role.Name.ToLower().Contains(search) || role.Description.ToLower().Contains(search));
        }

        return await query.OrderBy(role => role.Name).ToPagedResponseAsync(request.Page, request.PageSize, role => role.ToDto(), cancellationToken);
    }

    public async Task<IReadOnlyCollection<PermissionDto>> GetPermissionsAsync(CancellationToken cancellationToken)
    {
        var permissions = await dbContext.Permissions.AsNoTracking().OrderBy(permission => permission.Category).ThenBy(permission => permission.Name).ToListAsync(cancellationToken);
        return permissions.Select(permission => permission.ToDto()).ToList();
    }

    public async Task<RoleDto> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        if (await dbContext.Roles.AnyAsync(role => role.Name == request.Name, cancellationToken))
        {
            throw new AppException("A role with the same name already exists.", 409);
        }

        var permissions = await dbContext.Permissions.Where(permission => request.PermissionIds.Contains(permission.Id)).ToListAsync(cancellationToken);
        var role = new Role
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            IsSystem = false,
            RolePermissions = permissions.Select(permission => new RolePermission { PermissionId = permission.Id }).ToList()
        };

        dbContext.Roles.Add(role);
        await dbContext.SaveChangesAsync(cancellationToken);

        await dbContext.Entry(role).Collection(current => current.RolePermissions).Query().Include(rolePermission => rolePermission.Permission).LoadAsync(cancellationToken);
        return role.ToDto();
    }

    public async Task<RoleDto> UpdateAsync(Guid id, UpdateRoleRequest request, CancellationToken cancellationToken)
    {
        FeatureValidators.Validate(request);

        var role = await dbContext.Roles
            .FirstOrDefaultAsync(current => current.Id == id, cancellationToken);

        if (role is null)
        {
            throw new AppException("Role not found.", 404);
        }

        role.Description = request.Description.Trim();

        var requestedPermissionIds = request.PermissionIds
            .Distinct()
            .ToArray();

        var validPermissionIds = await dbContext.Permissions
            .Where(permission => requestedPermissionIds.Contains(permission.Id))
            .Select(permission => permission.Id)
            .ToArrayAsync(cancellationToken);

        if (validPermissionIds.Length != requestedPermissionIds.Length)
        {
            throw new AppException("One or more selected permissions are invalid.", 400);
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        await dbContext.RolePermissions
            .Where(rolePermission => rolePermission.RoleId == role.Id)
            .ExecuteDeleteAsync(cancellationToken);

        foreach (var permissionId in validPermissionIds)
        {
            dbContext.RolePermissions.Add(new RolePermission
            {
                RoleId = role.Id,
                PermissionId = permissionId
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await dbContext.Entry(role).Collection(current => current.RolePermissions).Query().Include(rolePermission => rolePermission.Permission).LoadAsync(cancellationToken);
        return role.ToDto();
    }
}
