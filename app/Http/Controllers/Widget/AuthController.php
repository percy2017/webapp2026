<?php

namespace App\Http\Controllers\Widget;

use App\Http\Controllers\Controller;
use App\Http\Requests\Widget\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Second argument true → issue the "remember me" cookie so the
        // visitor survives browser restart even if the session id has been
        // pruned server-side. Chat login should be sticky.
        if (! Auth::attempt($credentials, true)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => User::find(Auth::id()),
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        // If the visitor gave us a password, use it (any non-empty string
        // is accepted — no complexity rules). Otherwise fall back to a
        // random 40-char password so anonymous chat still works for users
        // who don't want to remember credentials. Either way the model
        // cast hashes it transparently.
        $password = $data['password'] ?? '';
        if ($password === '') {
            $password = Str::random(40);
        }

        $user = User::create([
            ...$data,
            'password' => $password,
        ]);

        $user->assignRole('user');

        // remember=true issues the long-lived `remember_web_*` cookie so
        // visitors who close the browser stay signed in. Combined with the
        // SESSION_LIFETIME bump in the env, the chat widget never logs a
        // visitor out automatically — only the explicit logout endpoint.
        Auth::login($user, true);
        $request->session()->regenerate();

        return response()->json(['user' => $user]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }
}
