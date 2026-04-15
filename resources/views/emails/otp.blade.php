<x-mail::message>
  # Welcome to Soko!

  Thank you for registering. To complete your account setup and unlock the digital marketplace, please use the
  verification code below.

  <div style="background-color: #eff6ff; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">
      {{ $code }}
    </span>
  </div>

  <x-mail::panel>
    **Security Note:** This code will expire in **10 minutes**. Please do not share this code with anyone.
  </x-mail::panel>

  If you did not create an account on Soko, you can safely ignore this email.

  Best wishes,<br>
  The Soko Team
</x-mail::message>
