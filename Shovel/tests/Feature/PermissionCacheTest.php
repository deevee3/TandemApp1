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

it('caches permissions per guard and invalidates on changes', function () {
    Permission::query()->create([
        'name' => 'View Dashboard',
        'slug' => 'dashboard.view',
        'guard_name' => 'web',
    ]);

    Permission::query()->create([
        'name' => 'Manage Users',
        'slug' => 'users.manage',
        'guard_name' => 'web',
    ]);

    expect(Permission::allCached())->toHaveCount(2);
    expect(Permission::allCached())->toHaveCount(2);

    Permission::query()->create([
        'name' => 'Manage Queues',
        'slug' => 'queues.manage',
        'guard_name' => 'web',
    ]);

    expect(Permission::allCached())->toHaveCount(3);

    Permission::flushCache();

    expect(Permission::allCached())->toHaveCount(3);
});

it('honors guard-specific permission lookups', function () {
    config(['auth.guards.api' => ['driver' => 'session', 'provider' => 'users']]);

    Permission::query()->create([
        'name' => 'API Metric View',
        'slug' => 'api.metric.view',
        'guard_name' => 'api',
    ]);

    Permission::query()->create([
        'name' => 'Web Metric View',
        'slug' => 'web.metric.view',
        'guard_name' => 'web',
    ]);

    expect(Permission::allCached('api'))->toHaveCount(1);
    expect(Permission::allCached('web'))->toHaveCount(1);
});
