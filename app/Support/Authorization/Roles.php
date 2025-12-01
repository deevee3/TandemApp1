<?php

namespace App\Support\Authorization;

final class Roles
{
    public const SUPER_ADMIN = 'super-admin';
    public const ADMIN = 'admin';
    public const SUPERVISOR = 'supervisor';
    public const HUMAN_AGENT = 'human-agent';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::SUPER_ADMIN,
            self::ADMIN,
            self::SUPERVISOR,
            self::HUMAN_AGENT,
        ];
    }
}
