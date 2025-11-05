<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class DatabaseSnapshot extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'database:snapshot {--comment= : Optional note appended to the backup filename}';

    /**
     * The console command description.
     */
    protected $description = 'Create a hot snapshot of the SQLite database, validate it, and emit a checksum.';

    public function handle(): int
    {
        $connection = DB::connection();

        if ($connection->getDriverName() !== 'sqlite') {
            $this->warn('database:snapshot currently supports only the sqlite driver. No snapshot created.');

            return self::SUCCESS;
        }

        $databasePath = $connection->getConfig('database');

        if ($databasePath === ':memory:' || ! $databasePath) {
            $this->error('Unable to determine on-disk SQLite database path.');

            return self::FAILURE;
        }

        if (! File::exists($databasePath)) {
            $this->error("Database file not found at {$databasePath}.");

            return self::FAILURE;
        }

        // Ensure any pending writes are flushed before copying.
        $connection->getPdo()->exec('PRAGMA wal_checkpoint(FULL);');

        $storageDirectory = storage_path('backups');
        File::ensureDirectoryExists($storageDirectory);

        $timestamp = Carbon::now();
        $comment = $this->option('comment');
        $suffix = $comment ? '_' . preg_replace('/[^A-Za-z0-9_-]+/', '-', $comment) : '';
        $baseName = $timestamp->format('Y-m-d_H') . $suffix;
        $snapshotPath = $storageDirectory . DIRECTORY_SEPARATOR . $baseName . '.sqlite';

        File::copy($databasePath, $snapshotPath);

        $this->validateSnapshot($snapshotPath);

        $hash = hash_file('sha256', $snapshotPath);
        File::put($snapshotPath . '.sha256', $hash . PHP_EOL);

        $compressedPath = $snapshotPath . '.gz';
        File::put($compressedPath, gzencode(File::get($snapshotPath), 9));

        $this->enforceRetention($storageDirectory, $timestamp);

        $this->info("Snapshot created: {$snapshotPath}");
        $this->line("Checksum: {$hash}");

        return self::SUCCESS;
    }

    protected function validateSnapshot(string $snapshotPath): void
    {
        $pdo = new \PDO('sqlite:' . $snapshotPath, null, null, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        ]);

        $statement = $pdo->query("SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'conversations', 'messages')");
        $tableCount = (int) $statement->fetchColumn();

        if ($tableCount < 3) {
            throw new \RuntimeException('Snapshot validation failed: expected core tables were not found.');
        }
    }

    protected function enforceRetention(string $directory, Carbon $now): void
    {
        $hourlyCutoff = $now->copy()->subHours(24);
        $dailyCutoff = $now->copy()->subDays(30);

        foreach (File::files($directory) as $file) {
            $path = $file->getPathname();
            $lastModified = Carbon::createFromTimestamp($file->getMTime());

            if (str_ends_with($path, '.sqlite')) {
                if ($lastModified->lt($hourlyCutoff)) {
                    File::delete($path);
                }
                continue;
            }

            if (str_ends_with($path, '.sqlite.gz') || str_ends_with($path, '.sqlite.sha256')) {
                if ($lastModified->lt($dailyCutoff)) {
                    File::delete($path);
                }
            }
        }
    }
}
