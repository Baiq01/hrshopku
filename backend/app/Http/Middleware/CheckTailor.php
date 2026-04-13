<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckTailor
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'tailor') {
            return response()->json(['message' => 'Unauthorized. Tailor access only.'], 403);
        }

        return $next($request);
    }
}
