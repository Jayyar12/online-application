<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Add this login route (even if you don't use it)
Route::get('/login', function () {
    return response()->json(['message' => 'Please login via API'], 401);
})->name('login');
