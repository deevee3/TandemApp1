<?php

use Illuminate\Support\Facades\Route;
use Laravel\WorkOS\Http\Requests\AuthKitAuthenticationRequest;
use Laravel\WorkOS\Http\Requests\AuthKitLoginRequest;
use Laravel\WorkOS\Http\Requests\AuthKitLogoutRequest;

Route::get('login', function (AuthKitLoginRequest $request) {
    $response = $request->redirect();
    
    if ($request->has('plan')) {
        // Store plan in cookie since session won't persist through OAuth
        $response->cookie('selected_plan', $request->query('plan'), 30); // 30 minutes
    }
    
    return $response;
})->middleware(['guest'])->name('login');

Route::get('authenticate', function (AuthKitAuthenticationRequest $request) {
    $request->authenticate();
    
    // Check for preselected plan from cookie
    $selectedPlan = $request->cookie('selected_plan');
    
    if ($selectedPlan) {
        // Store in session for the billing page and clear the cookie
        session(['selected_plan' => $selectedPlan]);
        return redirect()->route('billing.plans')->withoutCookie('selected_plan');
    }
    
    return to_route('dashboard');
})->middleware(['guest']);

Route::post('logout', function (AuthKitLogoutRequest $request) {
    return $request->logout();
})->middleware(['auth'])->name('logout');
