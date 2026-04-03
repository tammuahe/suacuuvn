<?php

use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get("/", [WelcomeController::class, "show"])->name("welcome");
Route::get("/shopping", [ShoppingController::class, "show"])->name("shopping");
