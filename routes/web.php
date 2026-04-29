<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShoppingController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'show'])->name('welcome');
Route::get('/products', [ShoppingController::class, 'show'])->name('shopping');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('shopping.product');
Route::get('/checkout', [ShoppingController::class, 'checkout'])->name('checkout');
Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.submit');
Route::get('/checkout/sucess', [ShoppingController::class, 'success'])->name('checkout.success');
Route::get('/order', [OrderController::class, 'lookup'])->name('order.lookup');
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'attempt'])->name('login.attempt');
Route::group(['prefix' => 'dashboard', 'as' => 'dashboard.'], function () {
    Route::get('/metrics', [DashboardController::class, 'showMetrics'])->name('metrics');
});
