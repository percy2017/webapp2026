<?php

use App\Models\Chat;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{chatId}', function ($user, int $chatId) {
    $chat = Chat::find($chatId);

    if (! $chat) {
        return false;
    }

    return (int) $chat->user_id === (int) $user->id
        || $user->hasRole('admin');
});

// Admin-only public channel — fired when a new chat is created from the
// public widget so every connected admin can pop a desktop notification.
Broadcast::channel('admin.chats', function ($user) {
    return $user->hasRole('admin');
});
