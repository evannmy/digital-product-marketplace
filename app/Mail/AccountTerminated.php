<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountTerminated extends Mailable // <-- This is the class your controller was looking for!
{
    use Queueable, SerializesModels;

    public $name; // 1. Make a public property

    /**
     * Create a new message instance.
     */
    public function __construct($name) // 2. Accept the variable
    {
        $this->name = $name; // 3. Assign it
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notice: Your Account Has Been Terminated',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.account-terminated',
            with: ['name' => $this->name],
        );
    }
}
