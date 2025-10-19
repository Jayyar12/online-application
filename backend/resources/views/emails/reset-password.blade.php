<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #E46036 0%, #d35530 100%); padding: 48px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                🔐 Reset Your Password
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 48px 40px;">
                            <p style="color: #111827; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; font-weight: 600;">
                                Hello!
                            </p>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                We received a request to reset the password for your account. Click the button below to create a new password.
                            </p>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 36px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $url }}" style="display: inline-block; background-color: #E46036; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(228, 96, 54, 0.3);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Info Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; margin: 24px 0;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                                            <strong>⏰ Important:</strong> This password reset link will expire in <strong>{{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} minutes</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 24px 0 0 0;">
                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </p>
                            
                            <!-- Divider -->
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
                            
                            <!-- Alternative Link Section -->
                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 24px 0;">
                                <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0;">
                                    <strong>Having trouble with the button?</strong> Copy and paste this link into your browser:
                                </p>
                                <p style="color: #E46036; font-size: 12px; line-height: 1.5; margin: 0; word-break: break-all; font-family: monospace;">
                                    {{ $url }}
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                                This is an automated email, please do not reply.
                            </p>
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Footer Text -->
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
                    Need help? Contact our support team.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>