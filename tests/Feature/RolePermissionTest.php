<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['cache.default' => 'array']);
    Cache::setDefaultDriver('array');
    Cache::store()->flush();

    Role::flushCache();
    Permission::flushCache();
});

it('caches roles per guard and respects cache invalidation', function () {
    Role::query()->create([
        'name' => 'Administrator',
        'slug' => 'admin',
        'guard_name' => 'web',
    ]);

    Role::query()->create([
        'name' => 'Supervisor',
        'slug' => 'supervisor',
        'guard_name' => 'web',
    ]);

    expect(Role::allCached())->toHaveCount(2);

    Role::query()->create([
        'name' => 'Human Agent',
        'slug' => 'human-agent',
        'guard_name' => 'web',
    ]);

    expect(Role::allCached())->toHaveCount(3);
});

it('retrieves roles scoped by guard', function () {
    config(['auth.guards.api' => ['driver' => 'session', 'provider' => 'users']]);

    Role::query()->create([
        'name' => 'Web Role',
        'slug' => 'web-role',
        'guard_name' => 'web',
    ]);

    Role::query()->create([
        'name' => 'Api Role',
        'slug' => 'api-role',
        'guard_name' => 'api',
    ]);

    expect(Role::allCached('web'))->toHaveCount(1);
    expect(Role::allCached('api'))->toHaveCount(1);
});

it('invalidates cached permissions when relationships change', function () {
    $role = Role::query()->create([
        'name' => 'Administrator',
        'slug' => 'admin',
        'guard_name' => 'web',
    ]);

    Role::allCached();

    $permission = Permission::query()->create([
        'name' => 'Manage Users',
        'slug' => 'users.manage',
        'guard_name' => 'web',
    ]);

    $role->permissions()->attach($permission->id);

    $cachedRole = Role::allCached()->firstWhere('id', $role->id);

    expect($cachedRole)->not->toBeNull();
    expect($cachedRole->permissions)->toHaveCount(1);
    expect($cachedRole->permissions->first()->slug)->toBe('users.manage');
});
