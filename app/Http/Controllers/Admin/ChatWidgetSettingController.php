<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateChatWidgetSettingRequest;
use App\Models\ChatWidgetSetting;
use Inertia\Inertia;
use Inertia\Response;

class ChatWidgetSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('chat-live/configuration/index', [
            'settings' => ChatWidgetSetting::current(),
        ]);
    }

    public function update(UpdateChatWidgetSettingRequest $request)
    {
        $settings = ChatWidgetSetting::current();
        $settings->update($request->validated());

        return back()->with('success', 'Configuración actualizada.');
    }
}
