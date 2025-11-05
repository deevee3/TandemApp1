<?php

namespace App\Models\Pivots;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\Pivot;

class RolePermission extends Pivot
{
    protected $table = 'role_permissions';
    protected $guarded = [];

    public $incrementing = true;
    public $timestamps = true;

    protected static function booted(): void
    {
        static::saved(function (self $pivot): void {
            static::flushRelatedCaches($pivot);
        });

        static::deleted(function (self $pivot): void {
            static::flushRelatedCaches($pivot);
        });
    }

    protected static function flushRelatedCaches(self $pivot): void
    {
        if ($role = Role::query()->find($pivot->role_id)) {
            Role::flushCache($role->guard_name);
        }

        if ($permission = Permission::query()->find($pivot->permission_id)) {
            Permission::flushCache($permission->guard_name);
        }
    }
}
