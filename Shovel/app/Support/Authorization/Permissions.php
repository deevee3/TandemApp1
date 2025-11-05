<?php

namespace App\Support\Authorization;

final class Permissions
{
    public const DASHBOARD_VIEW = 'dashboard.view';
    public const USERS_MANAGE = 'users.manage';
    public const QUEUES_MANAGE = 'queues.manage';
    public const CONVERSATIONS_REVIEW = 'conversations.review';
    public const GUARDRAILS_ADJUST = 'guardrails.adjust';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::DASHBOARD_VIEW,
            self::USERS_MANAGE,
            self::QUEUES_MANAGE,
            self::CONVERSATIONS_REVIEW,
            self::GUARDRAILS_ADJUST,
        ];
    }
}
