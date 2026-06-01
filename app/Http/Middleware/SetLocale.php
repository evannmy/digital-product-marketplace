<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Cek apakah ada bahasa yang dikirim dari React lewat Header
        if ($request->hasHeader('X-Locale')) {
            $locale = $request->header('X-Locale');

            // Pastikan hanya bahasa yang didukung
            if (in_array($locale, ['en', 'id'])) {
                App::setLocale($locale);
                Session::put('locale', $locale); // Simpan juga ke session untuk berjaga-jaga
            }
        }
        // 2. Fallback ke Session jika tidak ada Header
        elseif (Session::has('locale')) {
            App::setLocale(Session::get('locale'));
        }

        return $next($request);
    }
}
