<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use App\Jobs\SendOtpEmail;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            if ($existingUser->is_verified) {
                return response()->json([
                    'message' => 'This email is already registered.',
                    'errors' => [
                        'email' => ['This email is already registered.']
                    ]
                ], 422);
            } else {
                $existingUser->delete();
            }
        }

        $otp = rand(100000, 999999);
        $otpExpiry = Carbon::now()->addMinutes(10);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'otp' => $otp,
            'otp_expires_at' => $otpExpiry,
            'is_verified' => false,
        ]);

        try {
            SendOtpEmail::dispatch($user->email, $otp, 'Email Verification Code - Smart Quiz')->onQueue('emails');

            return response()->json([
                'message' => 'User registered successfully. Check your email for the OTP.',
                'email' => $user->email,
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Job dispatch failed: ' . $e->getMessage());
            $user->delete();
            return response()->json([
                'message' => 'Registration failed. Could not queue OTP email.',
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $cacheKey = 'otp_user_' . $request->email;

        $user = Cache::remember($cacheKey, 300, function () use ($request) {
            return User::where('email', $request->email)
                        ->where('otp', $request->otp)
                        ->where('is_verified', false)
                        ->first();
        });

        if (!$user) {
            return response()->json([
                'message' => 'Invalid OTP or email already verified'
            ], 400);
        }

        if ($user->otp_expires_at && Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json([
                'message' => 'OTP has expired. Please request a new one.'
            ], 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'is_verified' => true,
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Email verified successfully. You can now log in.'
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $cacheKey = 'otp_user_' . $request->email;

        $user = Cache::remember($cacheKey, 300, function () use ($request) {
            return User::where('email', $request->email)
                        ->where('is_verified', false)
                        ->first();
        });

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
            SendOtpEmail::dispatch($user->email, $otp, 'New Email Verification Code - Smart Quiz');
            Cache::forget($cacheKey);

            return response()->json([
                'message' => 'New OTP queued for sending to your email.'
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Job dispatch failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to queue OTP email.'
            ], 500);
        }
    }


    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $cacheKey = 'user_' . $request->email;

        $user = Cache::remember($cacheKey, 300, function () use ($request) {
            return User::where('email', $request->email)->first();
        });

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_verified) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'email' => $user->email,
                'needsVerification' => true,
            ], 403);
        }

        Cache::forget($cacheKey);

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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

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
