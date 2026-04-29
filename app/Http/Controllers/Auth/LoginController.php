<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function show()
    {
        return Inertia::render('dashboard/Login');
    }

    public function attempt(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $route = \in_array(Auth::user()->getRole(), ['admin', 'staff'])
                ? route('dashboard.metrics')
                : route('welcome');

            return redirect()->intended($route);
        }

        return back()->withErrors([
            'username' => 'Thông tin đăng nhập không đúng',
        ])->onlyInput('username');
    }
}
