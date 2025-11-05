<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;

class AgentPromptBuilder
{
    public function build(Conversation $conversation): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => $this->systemPrompt($conversation),
            ],
        ];

        $conversation->loadMissing('messages');
        $conversation->messages
            ->sortBy('created_at')
            ->each(function (Message $message) use (&$messages) {
                $messages[] = [
                    'role' => $this->mapRole($message->sender_type),
                    'content' => $message->content,
                ];
            });

        return $messages;
    }

    protected function mapRole(string $senderType): string
    {
        return match ($senderType) {
            Message::SENDER_REQUESTER => 'user',
            Message::SENDER_AGENT, Message::SENDER_HUMAN => 'assistant',
            Message::SENDER_SYSTEM => 'system',
            default => 'user',
        };
    }

    protected function systemPrompt(Conversation $conversation): string
    {
        $subject = $conversation->subject ? "Subject: {$conversation->subject}." : '';

        return <<<PROMPT
You are Tandem's automated agent. Respond as JSON matching this schema exactly:
{
  "response": string,
  "confidence": number between 0 and 1,
  "handoff": boolean,
  "reason": string,
  "policy_flags": string[]
}
- Use lowercase snake_case for reason values (e.g. low_confidence, policy_flag, uncertain_intent, tool_error).
- If you are uncertain how to proceed, set handoff to true with reason "uncertain_intent".
{$subject}
PROMPT;
    }
}
