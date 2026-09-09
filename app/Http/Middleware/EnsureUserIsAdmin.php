<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null || ! $request->user()->isAdmin()) {
            return ApiResponse::error('Administrator access is required.', 403);
        }

        return $next($request);
    }
}
