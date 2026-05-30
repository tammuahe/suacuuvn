<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private string $settingsPath;

    public function __construct()
    {
        $this->settingsPath = storage_path('app/store_settings.json');
    }

    public function index(): Response
    {
        return Inertia::render('dashboard/Settings', [
            'store' => $this->loadSettings(),
            'user' => [
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
                'role' => auth()->user()->role ?? 'admin',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => ['nullable', 'string', 'max:200'],
            'store_phone' => ['nullable', 'string', 'max:20'],
            'store_email' => ['nullable', 'email', 'max:150'],
            'store_address' => ['nullable', 'string', 'max:500'],
            'email_notifications' => ['nullable', 'boolean'],
        ]);

        $settings = $this->loadSettings();
        $settings['store_name'] = $validated['store_name'] ?? $settings['store_name'] ?? '';
        $settings['store_phone'] = $validated['store_phone'] ?? $settings['store_phone'] ?? '';
        $settings['store_email'] = $validated['store_email'] ?? $settings['store_email'] ?? '';
        $settings['store_address'] = $validated['store_address'] ?? $settings['store_address'] ?? '';
        $settings['email_notifications'] = $validated['email_notifications'] ?? $settings['email_notifications'] ?? false;

        File::put($this->settingsPath, json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return redirect()->route('dashboard.settings')
            ->with('flash.success', 'Đã lưu cài đặt.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], auth()->user()->password)) {
            return back()->withErrors(['current_password' => 'Mật khẩu hiện tại không đúng.']);
        }

        auth()->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('dashboard.settings')
            ->with('flash.success', 'Đã đổi mật khẩu.');
    }

    private function loadSettings(): array
    {
        $defaults = [
            'store_name' => '',
            'store_phone' => '',
            'store_email' => '',
            'store_address' => '',
            'email_notifications' => false,
        ];

        if (! File::exists($this->settingsPath)) {
            return $defaults;
        }

        $data = json_decode(File::get($this->settingsPath), true);

        return is_array($data) ? array_merge($defaults, $data) : $defaults;
    }
}
