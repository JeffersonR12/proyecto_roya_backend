<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/forgot-password', [AuthController::class, 'showForgot'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink']);
});

Route::middleware('auth')->group(function () {
    Route::get('/', [AnalysisController::class, 'index'])->name('home');
    Route::post('/analysis', [AnalysisController::class, 'store'])->name('analysis.store');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
