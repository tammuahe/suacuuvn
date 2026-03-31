<?php

use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get("/", [WelcomeController::class, "show"])->name("welcome");
