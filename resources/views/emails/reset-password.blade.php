<x-mail::message>
  # Password Reset Request

  We received a request to reset the password for your Soko account.

  If you made this request, click the button below to choose a new password. This link will expire in 60 minutes.

  <x-mail::button :url="$url" color="primary">
    Reset Password
  </x-mail::button>

  If you did not request a password reset, no further action is required and your account remains secure.

  Thanks,<br>
  The Soko Team
</x-mail::message>
