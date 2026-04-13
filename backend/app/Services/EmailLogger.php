<?php
namespace App\Services;

use App\Models\EmailLog;
use Illuminate\Support\Facades\Log as LaravelLog;

class EmailLogger
{
    public static function sent(string $to, string $subject, string $template, array $payload = []): void
    {
        try {
            EmailLog::create([
                'to' => $to,
                'subject' => $subject,
                'template' => $template,
                'payload' => $payload,
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (\Throwable $e) {
            LaravelLog::warning('EmailLogger store sent failed: '.$e->getMessage());
        }
    }

    public static function failed(string $to, string $subject, string $template, array $payload = [], string $error = ''): void
    {
        try {
            EmailLog::create([
                'to' => $to,
                'subject' => $subject,
                'template' => $template,
                'payload' => $payload,
                'status' => 'failed',
                'error' => $error,
                'sent_at' => now(),
            ]);
        } catch (\Throwable $e) {
            LaravelLog::warning('EmailLogger store failed failed: '.$e->getMessage());
        }
    }
}
