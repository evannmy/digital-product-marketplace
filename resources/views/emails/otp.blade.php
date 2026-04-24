<x-mail::message>
  # Welcome to Soko.

  Thank you for registering. To complete your account setup and unlock the digital marketplace, please use the
  verification code below.

  <div
    style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 32px 0;">
    <span
      style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #0f172a; padding-left: 12px;">
      {{ $code }}
    </span>
  </div>

  <x-mail::panel>
    **Security Note:** This code will expire in **10 minutes**. Please do not share this code with anyone.
  </x-mail::panel>

  If you did not create an account, you can safely ignore this email.

  Best regards,<br>
  The Soko Team
</x-mail::message>
