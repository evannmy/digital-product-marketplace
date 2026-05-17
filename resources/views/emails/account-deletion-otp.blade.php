<x-mail::message>
  # <span style="color: #e11d48;">URGENT: Account Deletion Request</span>

  We received a request to permanently delete your Soko account. If you initiated this, please use the verification code
  below to confirm.

  <div
    style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 32px 0;">
    <span
      style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #9f1239; padding-left: 12px;">
      {{ $code }}
    </span>
  </div>

  <x-mail::panel>
    **Warning:** This code will expire in **10 minutes**. Deleting your account is irreversible.
    <br><br>
    **Did not request this?** Change your password immediately, as someone may have compromised your account.
  </x-mail::panel>

  Best regards,<br>
  The Soko Team
</x-mail::message>
