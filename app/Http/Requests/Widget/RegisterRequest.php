<?php

namespace App\Http\Requests\Widget;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            // Optional — visitors from the floating widget can pick any
            // password (even a 1-char "clave simple"). The seeded user
            // account is auto-assigned a random 40-char password by the
            // controller when this is left blank, so anonymous chat still
            // works for users who don't want to remember a password.
            // We intentionally do NOT use Laravel's `Password` rule
            // (LetterHasMixedCase / Numbers / Symbols) — the chat widget
            // is a low-stakes support channel, not the admin.
            'password' => ['nullable', 'string', 'min:1', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'El teléfono es obligatorio.',
            'phone.regex' => 'El teléfono solo puede contener números, espacios, guiones y el signo +.',
        ];
    }
}
