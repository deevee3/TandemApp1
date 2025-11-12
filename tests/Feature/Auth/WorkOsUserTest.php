<?php

use App\Models\User;

it('generates a password when creating a WorkOS user', function () {
    $user = User::create([
        'name' => 'WorkOS Example',
        'email' => 'workos@example.test',
        'workos_id' => 'workos-'.uniqid(),
        'avatar' => '',
    ]);

    expect($user->getRawOriginal('password'))
        ->not->toBeNull()
        ->and($user->getRawOriginal('password'))
        ->not->toBe('')
        ->and(strlen($user->getRawOriginal('password')))
        ->toBeGreaterThan(30);

    expect($user->password)->toEqual($user->getRawOriginal('password'));
});
