<?php

namespace Database\Seeders;

use App\Models\HandoffPolicy;
use App\Models\HandoffPolicyRule;
use App\Models\Skill;
use Illuminate\Database\Seeder;

class HandoffPolicySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $policies = [
            'low_confidence' => [
                'name' => 'Low Confidence Escalation',
                'confidence_threshold' => 0.6,
                'metadata' => ['seeded' => true],
                'rules' => [[
                    'trigger_type' => 'confidence_below_threshold',
                    'criteria' => ['threshold' => 0.6],
                    'priority' => 100,
                ]],
                'skills' => ['Technical Support'],
            ],
            'policy_flagged' => [
                'name' => 'Policy Flag Review',
                'metadata' => ['seeded' => true],
                'rules' => [[
                    'trigger_type' => 'policy_flag_detected',
                    'criteria' => ['flags' => ['pii', 'legal', 'compliance']],
                    'priority' => 90,
                ]],
                'skills' => ['Compliance'],
            ],
            'tool_error' => [
                'name' => 'Tool Error Intervention',
                'metadata' => ['seeded' => true],
                'rules' => [[
                    'trigger_type' => 'tool_error',
                    'criteria' => ['retryable' => false],
                    'priority' => 80,
                ]],
                'skills' => ['Technical Support'],
            ],
        ];

        foreach ($policies as $reasonCode => $config) {
            $policy = HandoffPolicy::query()->updateOrCreate(
                ['reason_code' => $reasonCode],
                [
                    'name' => $config['name'],
                    'confidence_threshold' => $config['confidence_threshold'] ?? null,
                    'metadata' => $config['metadata'] ?? null,
                    'active' => true,
                    'updated_at' => $now,
                ] + ['created_at' => $now]
            );

            $skillIds = Skill::query()
                ->whereIn('name', $config['skills'] ?? [])
                ->pluck('id')
                ->all();

            if (! empty($skillIds)) {
                $policy->skills()->syncWithoutDetaching(array_fill_keys($skillIds, ['created_at' => $now, 'updated_at' => $now]));
            }

            foreach ($config['rules'] as $ruleConfig) {
                HandoffPolicyRule::query()->updateOrCreate(
                    [
                        'handoff_policy_id' => $policy->id,
                        'trigger_type' => $ruleConfig['trigger_type'],
                    ],
                    [
                        'criteria' => $ruleConfig['criteria'] ?? null,
                        'priority' => $ruleConfig['priority'] ?? 0,
                        'active' => true,
                        'updated_at' => $now,
                        'created_at' => $policy->created_at ?? $now,
                    ]
                );
            }
        }
    }
}
