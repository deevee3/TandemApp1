<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class EnsurePermission
{
    /**
     * @param  list<string>  $permissions
     */
    public function handle(Request $request, Closure $next, string ...$permissions)
    {
        $user = $request->user();

        if (! $user) {
            throw new AccessDeniedHttpException('Authentication required.');
        }

        if ($permissions === []) {
            return $next($request);
        }

        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                return $next($request);
            }
        }

        throw new AccessDeniedHttpException('You do not have permission to perform this action.');
    }
}
