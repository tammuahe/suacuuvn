<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ShoppingController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'show'])->name('welcome');
Route::get('/products', [ShoppingController::class, 'show'])->name('shopping');
Route::get('/orders/{reference}/confirmation', [OrderController::class, 'confirmation'])->name('orders.confirmation');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('shopping.product');
