<?php

namespace HiEvents\Http\Middleware;

use Closure;
use HiEvents\Services\Domain\Demo\MidtermDemoFeatureGate;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DemoFeatureGateMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (MidtermDemoFeatureGate::isRequestBlocked($request)) {
            return response()->json([
                'message' => 'Not Found',
            ], Response::HTTP_NOT_FOUND);
        }

        return $next($request);
    }
}
