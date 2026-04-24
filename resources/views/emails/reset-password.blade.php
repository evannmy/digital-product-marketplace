<x-mail::message>
  # Set New Password.

  We received a request to reset the password for your Soko account.

  If you made this request, click the button below to choose a new password and regain access to the marketplace.

  <x-mail::button :url="$url" color="primary">
    Reset Password
  </x-mail::button>

  <x-mail::panel>
    **Security Note:** This password reset link will expire in **60 minutes**. If you did not request this change, no
    further action is required and your account remains secure.
  </x-mail::panel>

  Best regards,<br>
  The Soko Team
</x-mail::message>
