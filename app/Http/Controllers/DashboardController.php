<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $stats = [
            [
                'title' => 'Total Conversations',
                'value' => number_format(Conversation::count()),
                'change' => '+0%', // Todo: Calculate actual change
                'trend' => 'neutral',
                'description' => 'all time',
            ],
            [
                'title' => 'Total Users',
                'value' => number_format(User::count()),
                'change' => '+0%',
                'trend' => 'neutral',
                'description' => 'all time',
            ],
            [
                'title' => 'System Events',
                'value' => number_format(AuditEvent::count()),
                'change' => '+0%',
                'trend' => 'neutral',
                'description' => 'all time',
            ],
        ];

        $activities = AuditEvent::with('user')
            ->orderByDesc('occurred_at')
            ->take(5)
            ->get()
            ->map(function ($event) {
                return [
                    'user' => $event->user ? $event->user->name : 'System',
                    'action' => $event->event_type,
                    'time' => $event->occurred_at ? $event->occurred_at->diffForHumans() : 'Just now',
                    'initials' => $event->user ? substr($event->user->name, 0, 2) : 'SY',
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'activities' => $activities,
        ]);
    }
}
