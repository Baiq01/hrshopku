<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmailLog;

class EmailLogController extends Controller
{
    public function index(Request $request)
    {
        $query = EmailLog::query()->orderByDesc('id');
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        $perPage = (int)($request->query('per_page', 20));
        return $query->paginate($perPage);
    }

    public function show($id)
    {
        return EmailLog::findOrFail($id);
    }
}
