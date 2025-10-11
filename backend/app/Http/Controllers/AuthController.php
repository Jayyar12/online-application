<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // ✅ Check if email exists and is unverified
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser) {
            if ($existingUser->is_verified) {
                // Email is already verified
                return response()->json([
                    'message' => 'This email is already registered.',
                    'errors' => [
                        'email' => ['This email is already registered.']
                    ]
                ], 422);
            } else {
                // Email exists but not verified - delete old record and create new
                $existingUser->delete();
            }
        }

        $otp = rand(100000, 999999);
        $otpExpiry = Carbon::now()->addMinutes(10); // OTP expires in 10 minutes

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'otp' => $otp,
            'otp_expires_at' => $otpExpiry,
            'is_verified' => false, // ✅ Mark as not verified
        ]);

        try {
            Mail::raw("Your OTP verification code is: $otp\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Email Verification Code - IQonic');
            });

            return response()->json([
                'message' => 'User registered successfully. Check your email for the OTP.',
                'email' => $user->email,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Mail sending failed: ' . $e->getMessage());
            
            // Delete unverified user if email fails
            $user->delete();
            
            return response()->json([
                'message' => 'Registration failed. Could not send OTP. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Email service unavailable'
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)
                    ->where('otp', $request->otp)
                    ->where('is_verified', false) // ✅ Only verify unverified users
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid OTP or email already verified'
            ], 400);
        }

        // ✅ Check if OTP is expired
        if ($user->otp_expires_at && Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json([
                'message' => 'OTP has expired. Please request a new one.'
            ], 400);
        }

        // ✅ Mark user as verified
        $user->email_verified_at = now();
        $user->is_verified = true;
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Email verified successfully. You can now log in.'
        ], 200);
    }

    /**
     * Resend OTP
     */
    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)
                    ->where('is_verified', false) // ✅ Only resend for unverified users
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found or already verified'
            ], 404);
        }

        $otp = rand(100000, 999999);
        $otpExpiry = Carbon::now()->addMinutes(10);
        
        $user->otp = $otp;
        $user->otp_expires_at = $otpExpiry;
        $user->save();

        try {
            Mail::raw("Your new OTP verification code is: $otp\n\nThis code will expire in 10 minutes.", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('New Email Verification Code - IQonic');
            });

            return response()->json([
                'message' => 'New OTP sent to your email.'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Mail sending failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to send OTP. Please try again.'
            ], 500);
        }
    }

    /**
     * Login only if email is verified
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // ✅ Check if user is verified
        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'email' => $user->email,
                'needsVerification' => true,
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get user info
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * ✅ Clean up unverified users (optional - run via cron job)
     * Delete users who haven't verified their email within 24 hours
     */
    public function cleanupUnverifiedUsers()
    {
        $deleted = User::where('is_verified', false)
                      ->where('created_at', '<', Carbon::now()->subHours(24))
                      ->delete();

        return response()->json([
            'message' => "Cleaned up {$deleted} unverified users"
        ]);
    }
}