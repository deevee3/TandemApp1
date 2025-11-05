<?php

use App\Models\ApiKey;
use Database\Seeders\CoreDatabaseSeeder;
use Illuminate\Support\Facades\Artisan;

it('issues a hashed API key while returning the plaintext once', function () {
    Artisan::call('apikey:issue', [
        'name' => 'Integration Test Key',
    ]);

    $output = Artisan::output();

    expect($output)->toContain('API key created');
    expect($output)->toContain('Plaintext key:');

    preg_match('/Plaintext key:\s+(\S+)/', $output, $matches);

    $plainKey = $matches[1] ?? null;

    expect($plainKey)->not()->toBeNull();
    expect($plainKey)->toStartWith('shovel_');

    $apiKey = ApiKey::query()->first();

    expect($apiKey)->not()->toBeNull();
    expect($apiKey->name)->toBe('Integration Test Key');
    expect($apiKey->key)->toBe(hash('sha256', $plainKey));
    expect($apiKey->scopes)->toBe([]);
});

it('seeds an API key when SEED_API_KEY is provided', function () {
    $seedKey = 'seed-token-for-test';

    putenv("SEED_API_KEY={$seedKey}");
    $_ENV['SEED_API_KEY'] = $seedKey;
    $_SERVER['SEED_API_KEY'] = $seedKey;

    try {
        Artisan::call('db:seed', [
            '--class' => CoreDatabaseSeeder::class,
        ]);
    } finally {
        putenv('SEED_API_KEY');
        unset($_ENV['SEED_API_KEY'], $_SERVER['SEED_API_KEY']);
    }

    $record = ApiKey::query()->where('key', hash('sha256', $seedKey))->first();

    expect($record)->not()->toBeNull();
    expect($record->name)->toBe('Seed Developer Key');
    expect($record->active)->toBeTrue();
    expect($record->metadata)->toMatchArray(['seeded' => true]);
});
