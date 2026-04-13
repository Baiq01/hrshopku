<?php
namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    protected $middleware = [
        // global middleware
        \Fruitcake\Cors\HandleCors::class,
    ];

    protected $middlewareGroups = [
        'web' => [],
        'api' => [
            \Fruitcake\Cors\HandleCors::class,
            \App\Http\Middleware\ForceJsonResponse::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    protected $routeMiddleware = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'is_admin' => \App\Http\Middleware\IsAdmin::class,
        'is_tailor' => \App\Http\Middleware\CheckTailor::class,
    ];
}
