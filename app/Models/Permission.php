<?php

namespace App\Models;

use App\Models\Pivots\RolePermission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class Permission extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected static function booted(): void
    {
        static::saved(fn (self $permission) => static::flushCache($permission->guard_name));
        static::deleted(fn (self $permission) => static::flushCache($permission->guard_name));
    }

    /**
     * @return BelongsToMany<Role>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
            ->using(RolePermission::class)
            ->withTimestamps();
    }

    public function scopeForGuard(Builder $query, ?string $guardName = null): Builder
    {
        return $query->where('guard_name', $guardName ?? static::defaultGuardName());
    }

    public static function defaultGuardName(): string
    {
        return (string) (config('auth.defaults.guard') ?? 'web');
    }

    public static function allCached(?string $guardName = null): Collection
    {
        $guard = $guardName ?? static::defaultGuardName();

        return Cache::rememberForever(static::cacheKey($guard), function () use ($guard) {
            return static::query()
                ->forGuard($guard)
                ->orderBy('name')
                ->get();
        });
    }

    public static function findBySlug(string $slug, ?string $guardName = null): ?self
    {
        return static::query()
            ->forGuard($guardName)
            ->where('slug', $slug)
            ->first();
    }

    public static function findBySlugOrFail(string $slug, ?string $guardName = null): self
    {
        return static::query()
            ->forGuard($guardName)
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public static function flushCache(?string $guardName = null): void
    {
        if ($guardName !== null) {
            Cache::forget(static::cacheKey($guardName));

            return;
        }

        static::allGuardNames()->each(function (string $guard) {
            Cache::forget(static::cacheKey($guard));
        });
    }

    protected static function cacheKey(string $guardName): string
    {
        return "rbac.permissions.{$guardName}";
    }

    /**
     * @return Collection<int, string>
     */
    protected static function allGuardNames(): Collection
    {
        $guards = collect(config('auth.guards', []))->keys();

        if ($guards->isEmpty()) {
            return collect([static::defaultGuardName()]);
        }

        if (! $guards->contains(static::defaultGuardName())) {
            $guards->push(static::defaultGuardName());
        }

        return $guards->unique()->values();
    }
}
