<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MidtransNotification extends Model
{
    use HasFactory;

    protected $fillable = ['transaction_id','order_number','signature_key','payload','processed_at'];

    protected $casts = [
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];
}
