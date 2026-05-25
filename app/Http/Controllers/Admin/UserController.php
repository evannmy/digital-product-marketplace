<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccountTerminated;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(20);

        return Inertia::render('admin/users', [
            'users' => $users,
        ]);
    }

    public function destroy(User $user)
    {
        // Safety check: Prevent admins from deleting themselves
        if (Auth::id() === $user->id) {
            return back()->with('error', 'You cannot delete your own admin account.');
        }

        // 1. CAPTURE DETAILS AND SEND NOTIFICATION EMAIL (HANYA JIKA TERVERIFIKASI)
        $userEmail = $user->email;
        $userName = $user->name;
        $isVerified = !is_null($user->email_verified_at);

        // Hanya kirim email jika akun tersebut sudah terverifikasi
        if ($isVerified) {
            Mail::to($userEmail)->send(new AccountTerminated($userName));
        }

        // --- PHYSICAL FILE CLEANUP ---

        // 2. Delete Profile Images (Public Disk)
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }
        if ($user->cover_photo_path) {
            Storage::disk('public')->delete($user->cover_photo_path);
        }

        // 3. Smart Cleanup for Products & Media Galleries
        $user->load('products.media');

        foreach ($user->products as $product) {
            // Always delete the public media gallery (images & videos) to save space
            foreach ($product->media as $mediaItem) {
                Storage::disk('public')->delete($mediaItem->file_path);
            }

            // THE SMART CHECK: Have there been any sales?
            $hasSales = $product->orderItems()->exists();

            if ($hasSales) {
                // --- SCENARIO A: Product has buyers ---
                // Keep the source file intact for past buyers.
                // Soft delete the product so it vanishes from the marketplace.
                $product->delete();
            } else {
                // --- SCENARIO B: Product has 0 sales ---
                // Nobody needs this. Destroy the heavy source file to save storage.
                if ($product->file_path) {
                    Storage::delete($product->file_path);
                }

                // Permanently wipe the database row, bypassing Soft Deletes
                $product->forceDelete();
            }
        }

        // 4. Database Cleanup
        // (This will cascade and delete their products and product_media rows automatically)
        $user->delete();

        // Tampilkan pesan sukses yang dinamis
        $message = $isVerified
            ? 'User deleted successfully and termination email sent.'
            : 'Unverified user deleted successfully (no email sent).';

        return back()->with('success', $message);
    }

    public function toggleStatus(User $user)
    {
        if (Auth::id() === $user->id) {
            return back()->with('error', 'You cannot disable your own admin account.');
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return back()->with('success', 'User status updated successfully.');
    }

    // =========================================================================
    // --- NEW: MANUAL VERIFICATION METHOD ---
    // =========================================================================

    public function verify(User $user)
    {
        if (!$user->email_verified_at) {
            $user->update([
                'email_verified_at' => now(),
                'otp_code' => null,
                'otp_expires_at' => null,
            ]);
        }

        return back()->with('success', 'User has been manually verified and OTP cleared.');
    }
}
