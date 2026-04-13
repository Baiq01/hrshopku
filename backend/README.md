# Backend (Laravel API)

Prerequisites:
- PHP 8.0+
- Composer
- MySQL or MariaDB

Setup (Windows PowerShell):

1. Copy environment file and set DB + Midtrans keys:

   cp .env.example .env
   # edit .env untuk DB dan MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY

2. Install dependencies:

   composer install

3. Generate app key & migrate:

   php artisan key:generate
   php artisan migrate --seed

Sanctum setup (required for API token auth):

- Install Sanctum locally if you created a new Laravel project:

   composer require laravel/sanctum
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   php artisan migrate

- In `app/Http/Kernel.php` ensure `\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class` is configured if using SPA cookie-based auth. For token-based API usage the personal access tokens are used and you can send the Bearer token in the Authorization header.

XAMPP (MySQL) note: If you're using XAMPP on Windows, use the MySQL credentials set in `backend/.env` (defaults in .env.example are for XAMPP: DB_USERNAME=root and empty DB_PASSWORD). Start Apache & MySQL from XAMPP Control Panel before migrating.

4. Run dev server:

   php artisan serve --host=127.0.0.1 --port=8000

API highlights:
- /api/products - list products
- /api/admin/products - admin CRUD (sanctum-protected)
- /api/checkout - create order & generate Midtrans Snap token
- /api/midtrans/notification - webhook for transaction status
