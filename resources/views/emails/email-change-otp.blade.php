<x-mail::message>
  # Soko Account Security

  You recently requested to change the email address associated with your account. To confirm this change, please use
  the verification code below.

  <div
    style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 32px 0;">
    <span
      style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #0f172a; padding-left: 12px;">
      {{ $code }}
    </span>
  </div>

  <x-mail::panel>
    **Security Note:** This code will expire in **10 minutes**. If you did not request this change, please change your
    password immediately.
  </x-mail::panel>

  Best regards,<br>
  The Soko Team
</x-mail::message>
