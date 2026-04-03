<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ShoppingController extends Controller
{
    public function show(){
        return Inertia::render('shopping/Shopping');
    }
}
