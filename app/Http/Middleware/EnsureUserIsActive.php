<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null || ! $request->user()->isActive()) {
            return ApiResponse::error('This account is disabled.', 403);
        }

        return $next($request);
    }
}
