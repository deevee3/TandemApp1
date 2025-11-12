<?php

namespace App\Console\Commands;

use App\Models\ApiKey;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class IssueApiKey extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'apikey:issue {name : Friendly name for the API key}
        {--scope=* : Optional scopes to associate with this key}';

    /**
     * The console command description.
     */
    protected $description = 'Issue a new API key and persist its hashed representation.';

    public function handle(): int
    {
        $name = trim((string) $this->argument('name'));
        $scopes = array_values(array_filter($this->option('scope') ?? []));

        if ($name === '') {
            $this->error('A name is required.');

            return self::FAILURE;
        }

        $plainKey = 'shovel_' . Str::random(48);
        $hashed = hash('sha256', $plainKey);

        $apiKey = ApiKey::query()->create([
            'name' => $name,
            'key' => $hashed,
            'scopes' => $scopes,
            'active' => true,
        ]);

        $this->info("API key created (ID: {$apiKey->id}).");
        $this->line('');
        $this->warn('Store this plaintext token securely; it will not be displayed again.');
        $this->line('Plaintext key: ' . $plainKey);

        return self::SUCCESS;
    }
}
