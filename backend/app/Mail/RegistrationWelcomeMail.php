<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $userName)
    {
        $this->userName = $userName;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Selamat Datang di HRSHOPKU')
                    ->from(config('mail.from.address'), config('mail.from.name'))
                    ->view('emails.registration_welcome');
    }
}
