<?php

namespace App\Support\Authorization;

final class Roles
{
    public const ADMIN = 'admin';
    public const SUPERVISOR = 'supervisor';
    public const HUMAN_AGENT = 'human-agent';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::ADMIN,
            self::SUPERVISOR,
            self::HUMAN_AGENT,
        ];
    }
}
