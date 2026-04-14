@props(['url'])
<tr>
  <td class="header">
    <a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
      <span style="font-size: 24px; font-weight: bold; color: #3d4852;">
        {{ config('app.name') }}
      </span>
    </a>
  </td>
</tr>
