<?php

use App\Http\Controllers\Admin\ChatController;
use App\Http\Controllers\Admin\ChatWidgetSettingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\PushSubscriptionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SiteMenuController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\SiteTemplateController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\PwaAssetsController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\Site\HomeController;
use App\Http\Controllers\Widget\AuthController as WidgetAuthController;
use App\Http\Controllers\Widget\ChatController as WidgetChatController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

// QR generator for public pages. No auth — anyone can render a QR.
Route::get('qr.svg', [QrController::class, 'svg'])->name('qr.svg');
Route::get('qr.png', [QrController::class, 'png'])->name('qr.png');
Route::get('qr/download', [QrController::class, 'download'])->name('qr.download');

// Admin panel — only users with the `admin` role can reach any /admin/*
// route. We attach `role:admin` to the outer group so individual sub-routes
// don't need to repeat it. Sub-groups inside still add permission gates for
// specific resources (manage-users, manage-roles, …) on top.
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('admin', [DashboardController::class, 'index'])->name('admin');

    // Web Push subscription management. Only admins can subscribe to the
    // admin-chats push channel, so the subscription endpoints live under
    // the admin role gate too.
    Route::post('admin/push-subscriptions', [PushSubscriptionController::class, 'store'])
        ->name('push-subscriptions.store');
    Route::delete('admin/push-subscriptions', [PushSubscriptionController::class, 'destroy'])
        ->name('push-subscriptions.destroy');

    Route::get('admin/agenda', [EventController::class, 'index'])->name('agenda.index');
    Route::get('admin/agenda/events', [EventController::class, 'eventsJson'])->name('agenda.events');
    Route::post('admin/agenda', [EventController::class, 'store'])->name('agenda.store');
    Route::patch('admin/agenda/{event}', [EventController::class, 'update'])->name('agenda.update');
    Route::delete('admin/agenda/{event}', [EventController::class, 'destroy'])->name('agenda.destroy');

    Route::get('admin/media', [MediaController::class, 'index'])->name('media.index');
    Route::get('admin/media/generate', [MediaController::class, 'generate'])->name('media.generate');
    Route::post('admin/media/generate', [MediaController::class, 'generateStore'])->name('media.generate.store');
    Route::get('admin/media/list', [MediaController::class, 'listJson'])->name('media.list');
    Route::post('admin/media', [MediaController::class, 'store'])->name('media.store');
    Route::delete('admin/media/{medium}', [MediaController::class, 'destroy'])->name('media.destroy');

    Route::middleware('permission:manage-users')->group(function () {
        Route::get('admin/users', [UserController::class, 'index'])->name('users.index');
        Route::get('admin/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('admin/users', [UserController::class, 'store'])->name('users.store');
        Route::get('admin/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::patch('admin/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('admin/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('admin/users/{user}/send-verification', [UserController::class, 'sendVerification'])
            ->name('users.send-verification');
        Route::post('admin/users/{user}/toggle-verified', [UserController::class, 'toggleVerified'])
            ->name('users.toggle-verified');
    });

    Route::middleware('permission:manage-roles')->group(function () {
        Route::get('admin/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('admin/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::patch('admin/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('admin/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });

    Route::middleware('permission:manage-templates')->group(function () {
        Route::get('admin/site-templates', [SiteTemplateController::class, 'index'])->name('site-templates.index');
        Route::get('admin/site-templates/create', [SiteTemplateController::class, 'create'])->name('site-templates.create');
        Route::post('admin/site-templates', [SiteTemplateController::class, 'store'])->name('site-templates.store');
        Route::get('admin/site-templates/{siteTemplate}/edit', [SiteTemplateController::class, 'edit'])->name('site-templates.edit');
        Route::patch('admin/site-templates/{siteTemplate}', [SiteTemplateController::class, 'update'])->name('site-templates.update');
        Route::delete('admin/site-templates/{siteTemplate}', [SiteTemplateController::class, 'destroy'])->name('site-templates.destroy');
        Route::post('admin/site-templates/{siteTemplate}/activate', [SiteTemplateController::class, 'activate'])->name('site-templates.activate');
    });

    Route::middleware('permission:manage-settings')->group(function () {
        Route::get('admin/site-settings', [SiteSettingController::class, 'edit'])->name('site-settings.edit');
        Route::patch('admin/site-settings', [SiteSettingController::class, 'update'])->name('site-settings.update');

        Route::get('admin/site-menu', [SiteMenuController::class, 'index'])->name('site-menu.index');
        Route::post('admin/site-menu', [SiteMenuController::class, 'store'])->name('site-menu.store');
        Route::patch('admin/site-menu/{siteMenuItem}', [SiteMenuController::class, 'update'])->name('site-menu.update');
        Route::delete('admin/site-menu/{siteMenuItem}', [SiteMenuController::class, 'destroy'])->name('site-menu.destroy');
        Route::post('admin/site-menu/{siteMenuItem}/up', [SiteMenuController::class, 'moveUp'])->name('site-menu.up');
        Route::post('admin/site-menu/{siteMenuItem}/down', [SiteMenuController::class, 'moveDown'])->name('site-menu.down');
    });

    Route::prefix('admin/chat-live')->name('chat-live.')->group(function () {
        Route::get('chats', [ChatController::class, 'index'])->name('chats.index');
        Route::get('chats/{chat}', [ChatController::class, 'show'])->name('chats.show');
        Route::get('chats/{chat}/poll', [ChatController::class, 'poll'])->name('chats.poll');
        Route::post('chats/{chat}/messages', [ChatController::class, 'sendMessage'])
            ->name('messages.store');
        Route::patch('chats/{chat}/status', [ChatController::class, 'status'])
            ->name('chats.status');
        Route::delete('chats/{chat}', [ChatController::class, 'destroy'])
            ->name('chats.destroy');

        Route::middleware('role:admin')->group(function () {
            Route::get('configuration', [ChatWidgetSettingController::class, 'edit'])
                ->name('config.edit');
            Route::patch('configuration', [ChatWidgetSettingController::class, 'update'])
                ->name('config.update');
        });
    });
});

Route::prefix('widget')->name('widget.')->middleware('throttle:30,1')->group(function () {
    Route::post('auth/login', [WidgetAuthController::class, 'login'])->name('auth.login');
    Route::post('auth/register', [WidgetAuthController::class, 'register'])->name('auth.register');
    Route::post('auth/logout', [WidgetAuthController::class, 'logout'])->name('auth.logout');

    Route::middleware('auth')->group(function () {
        Route::get('chat', [WidgetChatController::class, 'show'])->name('chat.show');
        Route::post('chat/messages', [WidgetChatController::class, 'sendMessage'])
            ->name('chat.send');
    });
});

require __DIR__.'/settings.php';

Route::get('/canvas', function () {
    return response()
        ->view('canvas')
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
});

// PWA assets are generated dynamically from the active SiteSetting so
// switching the active template changes the manifest + icons
// immediately, no rebuild required.
Route::get('/manifest.webmanifest', [PwaAssetsController::class, 'manifest'])
    ->name('pwa.manifest');

Route::get('/canvas/peluqueria-view', function () {
    return response()
        ->view('canvas-peluqueria')
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
});
