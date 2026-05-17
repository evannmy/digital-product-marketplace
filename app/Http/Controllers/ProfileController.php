<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request)
    {
        return Inertia::render('profile/edit', [
            // Force passing the fully loaded user directly to the frontend!
            'user_data' => $request->user()
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        // 1. Add boolean flags and STRICT username validation
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'username' => [
                'required',
                'string',
                'max:30',
                'regex:/^[a-zA-Z0-9_]+$/',
                'unique:users,username,' . $request->user()->id
            ],
            'bio' => ['nullable', 'string'],
            'website' => ['nullable', 'string', 'max:255'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'github' => ['nullable', 'string', 'max:255'],

            // --- THE FIX: Changed max:2048 to max:5120 (5MB in Kilobytes) ---
            'cover_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],

            'remove_cover_photo' => ['nullable', 'boolean'],
            'remove_avatar' => ['nullable', 'boolean'],
        ], [
            'username.regex' => 'The username may only contain letters, numbers, and underscores.'
        ]);

        $user = $request->user();

        // 2. Handle Cover Photo Deletion (If user clicked Trash icon)
        if ($request->boolean('remove_cover_photo')) {
            if ($user->cover_photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->cover_photo_path);
            }
            $user->cover_photo_path = null;
        }

        // 3. Handle Avatar Deletion (If user clicked Trash icon)
        if ($request->boolean('remove_avatar')) {
            if ($user->avatar_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar_path);
            }
            $user->avatar_path = null;
        }

        // 4. Handle NEW Cover Photo Upload
        if ($request->hasFile('cover_photo')) {
            if ($user->cover_photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->cover_photo_path);
            }
            $user->cover_photo_path = $request->file('cover_photo')->store('covers', 'public');
        }

        // 5. Handle NEW Avatar Upload
        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar_path);
            }
            $user->avatar_path = $request->file('avatar')->store('avatars', 'public');
        }

        // 6. Update the rest of the text fields
        $user->fill([
            'name' => $validated['name'],
            'username' => strtolower($validated['username']),
            'bio' => $validated['bio'],
            'website' => $validated['website'],
            'instagram' => $validated['instagram'],
            'github' => $validated['github'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Live API Check: Is this username available?
     */
    public function checkUsername(\Illuminate\Http\Request $request)
    {
        $request->validate(['username' => 'required|string|max:30']);

        $query = \App\Models\User::where('username', strtolower($request->username));

        // Only exclude the ID if the user is actually logged in (Profile Edit)
        if ($user = $request->user()) {
            $query->where('id', '!=', $user->id);
        }

        return response()->json([
            'available' => !$query->exists()
        ]);
    }
}
