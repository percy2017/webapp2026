<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $users = User::query()
            ->with('roles', 'avatarMedia')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $users->getCollection()->transform(function (User $user) {
            $user->avatar_url = $user->avatar_url;
            $user->roles_list = $user->roles->pluck('name')->implode(', ');

            return $user;
        });

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => ['search' => $search],
            'roles' => Role::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('users/create', [
            'roles' => Role::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $password = $data['password'];
        $emailVerified = (bool) ($data['email_verified'] ?? false);
        unset($data['password'], $data['avatar'], $data['media_id'], $data['email_verified']);

        $user = User::create(
            $data + [
                'password' => $password,
                'email_verified_at' => $emailVerified ? now() : null,
            ]
        );

        $this->syncAvatar($request, $user);

        if ($request->filled('roles')) {
            $user->syncRoles($request->input('roles'));
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    public function edit(User $user): Response
    {
        $user->load('roles', 'avatarMedia');

        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => Role::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function sendVerification(Request $request, User $user)
    {
        $this->authorize('update', $user);

        if ($user->hasVerifiedEmail()) {
            return back()->with('success', 'El email ya estaba verificado.');
        }

        $user->sendEmailVerificationNotification();

        return back()->with('success', 'Email de verificación enviado a '.$user->email.'.');
    }

    public function toggleVerified(Request $request, User $user)
    {
        $this->authorize('update', $user);

        if ($user->hasVerifiedEmail()) {
            $user->forceFill(['email_verified_at' => null])->save();

            return back()->with('success', 'Email desmarcado como no verificado.');
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        return back()->with('success', 'Email marcado como verificado.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        $this->syncAvatar($request, $user);

        if ($request->filled('roles')) {
            $user->syncRoles($request->input('roles'));
        }

        return redirect()
            ->route('users.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return back()->with('success', 'Usuario eliminado.');
    }

    private function syncAvatar(Request $request, User $user): void
    {
        if ($request->boolean('remove_avatar')) {
            $user->avatar_media_id = null;
            $user->save();

            return;
        }

        if ($request->filled('media_id')) {
            $user->avatar_media_id = $request->integer('media_id');
            $user->save();

            return;
        }

        if ($request->hasFile('avatar')) {
            $media = $user
                ->addMediaFromRequest('avatar')
                ->toMediaCollection('avatar');

            $user->avatar_media_id = $media->id;
            $user->save();
        }
    }
}
