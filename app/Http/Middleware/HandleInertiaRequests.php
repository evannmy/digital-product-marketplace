<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Auth;
use App\Models\CartItem;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                // --- UPDATED: Use the only() method to safely share ALL necessary columns ---
                'user' => $request->user() ? $request->user()->only(
                    'id',
                    'name',
                    'email',
                    'role',
                    'username',
                    'bio',
                    'website',
                    'instagram',
                    'github',
                    'avatar_path',
                    'cover_photo_path'
                ) : null,
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'info' => fn() => $request->session()->get('info'),
            ],
            'cartCount' => function () use ($request) {
                if ($request->user()) {
                    return \App\Models\CartItem::whereHas('cart', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })->count();
                }
                return 0;
            },
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
