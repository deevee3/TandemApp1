<?php

use App\Models\Conversation;
use App\Services\ConversationLifecycleService;

return [
    'conversation' => [
        'class' => Conversation::class,
        'graph' => 'conversation',
        'property_path' => 'status',
        'metadata' => [
            'title' => 'Conversation Lifecycle',
        ],
        'states' => array_map(fn (string $status) => ['name' => $status], Conversation::statuses()),
        'transitions' => [
            'agent_begins' => [
                'from' => [Conversation::STATUS_NEW, Conversation::STATUS_BACK_TO_AGENT],
                'to' => Conversation::STATUS_AGENT_WORKING,
            ],
            'handoff_required' => [
                'from' => [Conversation::STATUS_AGENT_WORKING],
                'to' => Conversation::STATUS_NEEDS_HUMAN,
            ],
            'enqueue_for_human' => [
                'from' => [Conversation::STATUS_NEEDS_HUMAN],
                'to' => Conversation::STATUS_QUEUED,
            ],
            'assign_human' => [
                'from' => [Conversation::STATUS_QUEUED],
                'to' => Conversation::STATUS_ASSIGNED,
            ],
            'human_accepts' => [
                'from' => [Conversation::STATUS_ASSIGNED],
                'to' => Conversation::STATUS_HUMAN_WORKING,
            ],
            'return_to_agent' => [
                'from' => [Conversation::STATUS_HUMAN_WORKING],
                'to' => Conversation::STATUS_BACK_TO_AGENT,
            ],
            'human_reclaim' => [
                'from' => [Conversation::STATUS_BACK_TO_AGENT, Conversation::STATUS_AGENT_WORKING],
                'to' => Conversation::STATUS_HUMAN_WORKING,
            ],
            'resolve' => [
                'from' => [Conversation::STATUS_AGENT_WORKING, Conversation::STATUS_HUMAN_WORKING],
                'to' => Conversation::STATUS_RESOLVED,
            ],
            'archive' => [
                'from' => [Conversation::STATUS_RESOLVED],
                'to' => Conversation::STATUS_ARCHIVED,
            ],
        ],
        'callbacks' => [
            'guard' => [],
            'before' => [],
            'after' => [
                'after_agent_begins' => [
                    'on' => 'agent_begins',
                    'do' => ConversationLifecycleService::class.'@afterAgentBegins',
                ],
                'after_handoff_required' => [
                    'on' => 'handoff_required',
                    'do' => ConversationLifecycleService::class.'@afterHandoffRequired',
                ],
                'after_enqueue_for_human' => [
                    'on' => 'enqueue_for_human',
                    'do' => ConversationLifecycleService::class.'@afterEnqueueForHuman',
                ],
                'after_assign_human' => [
                    'on' => 'assign_human',
                    'do' => ConversationLifecycleService::class.'@afterAssignHuman',
                ],
                'after_human_accepts' => [
                    'on' => 'human_accepts',
                    'do' => ConversationLifecycleService::class.'@afterHumanAccepts',
                ],
                'after_return_to_agent' => [
                    'on' => 'return_to_agent',
                    'do' => ConversationLifecycleService::class.'@afterReturnToAgent',
                ],
                'after_human_reclaim' => [
                    'on' => 'human_reclaim',
                    'do' => ConversationLifecycleService::class.'@afterHumanReclaim',
                ],
                'after_resolve' => [
                    'on' => 'resolve',
                    'do' => ConversationLifecycleService::class.'@afterResolve',
                ],
                'after_archive' => [
                    'on' => 'archive',
                    'do' => ConversationLifecycleService::class.'@afterArchive',
                ],
            ],
        ],
    ],
];
