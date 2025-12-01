<?php

namespace App\Http\Middleware;

use App\Support\Authorization\Roles;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSubscribed
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Super admins bypass subscription requirements
            if ($user->hasRole(Roles::SUPER_ADMIN)) {
                return $next($request);
            }

            if (! $user->subscribed('default')) {
                return redirect()->route('billing.plans');
            }
        }

        return $next($request);
    }
}
