<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendOtpEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $email;
    protected $otp;
    protected $subject;

    public function __construct($email, $otp, $subject)
    {
        $this->email = $email;
        $this->otp = $otp;
        $this->subject = $subject;
    }

    public function handle()
    {
        Mail::raw("Your OTP verification code is: {$this->otp}\n\nThis code will expire in 10 minutes.", function ($message) {
            $message->to($this->email)->subject($this->subject);
        });
    }
}
