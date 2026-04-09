<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ShoppingController extends Controller
{
    public function show()
    {
        return Inertia::render('shopping/Shopping');
    }
}
