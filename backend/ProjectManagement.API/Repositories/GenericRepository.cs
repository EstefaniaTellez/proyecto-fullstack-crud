using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Data;
using System.Linq.Expressions;
using System.Reflection;

namespace ProjectManagement.API.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly ProjectManagementContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(ProjectManagementContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await ApplySoftDeleteFilter(_dbSet).ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var entity = await _dbSet.FindAsync(id);
            return entity != null && !IsEntityDeleted(entity) ? entity : null;
        }

        public async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity == null) return false;

            var isDeletedProperty = entity.GetType().GetProperty("IsDeleted");
            var isActiveProperty = entity.GetType().GetProperty("IsActive");

            if (isDeletedProperty != null && isDeletedProperty.PropertyType == typeof(bool))
            {
                isDeletedProperty.SetValue(entity, true);
                _dbSet.Update(entity);
            }
            else if (isActiveProperty != null && isActiveProperty.PropertyType == typeof(bool))
            {
                isActiveProperty.SetValue(entity, false);
                _dbSet.Update(entity);
            }
            else
            {
                _dbSet.Remove(entity);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RestoreAsync(int id)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity == null) return false;

            var isDeletedProperty = entity.GetType().GetProperty("IsDeleted");
            var isActiveProperty = entity.GetType().GetProperty("IsActive");

            if (isDeletedProperty != null && isDeletedProperty.PropertyType == typeof(bool))
            {
                isDeletedProperty.SetValue(entity, false);
                _dbSet.Update(entity);
            }
            else if (isActiveProperty != null && isActiveProperty.PropertyType == typeof(bool))
            {
                isActiveProperty.SetValue(entity, true);
                _dbSet.Update(entity);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await ApplySoftDeleteFilter(_dbSet).Where(predicate).ToListAsync();
        }

        private IQueryable<T> ApplySoftDeleteFilter(IQueryable<T> query)
        {
            var entityType = typeof(T);
            
            var isDeletedProperty = entityType.GetProperty("IsDeleted");
            if (isDeletedProperty != null && isDeletedProperty.PropertyType == typeof(bool))
            {
                var parameter = Expression.Parameter(entityType, "x");
                var property = Expression.Property(parameter, isDeletedProperty);
                var constant = Expression.Constant(false);
                var equal = Expression.Equal(property, constant);
                var lambda = Expression.Lambda<Func<T, bool>>(equal, parameter);

                return query.Where(lambda);
            }

            var isActiveProperty = entityType.GetProperty("IsActive");
            if (isActiveProperty != null && isActiveProperty.PropertyType == typeof(bool))
            {
                var parameter = Expression.Parameter(entityType, "x");
                var property = Expression.Property(parameter, isActiveProperty);
                var constant = Expression.Constant(true);
                var equal = Expression.Equal(property, constant);
                var lambda = Expression.Lambda<Func<T, bool>>(equal, parameter);

                return query.Where(lambda);
            }

            return query;
        }

        private bool IsEntityDeleted(T entity)
        {
            var entityType = entity.GetType();
            
            var isDeletedProperty = entityType.GetProperty("IsDeleted");
            if (isDeletedProperty != null && isDeletedProperty.PropertyType == typeof(bool))
            {
                return (bool)isDeletedProperty.GetValue(entity);
            }

            var isActiveProperty = entityType.GetProperty("IsActive");
            if (isActiveProperty != null && isActiveProperty.PropertyType == typeof(bool))
            {
                return !(bool)isActiveProperty.GetValue(entity);
            }

            return false;
        }

        public async Task<IEnumerable<T>> GetAllIncludingDeletedAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<T>> FindIncludingDeletedAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }

        public async Task<T?> GetByIdIncludingDeletedAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }
    }
}
