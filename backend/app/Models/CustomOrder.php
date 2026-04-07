<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'size',
        'color',
        'fabric_type',
        'measurements',
        'design_notes',
        'reference_image',
        'quantity',
        'estimated_price',
        'status',
        'tracking_number',
        'shipping_courier',
        'shipped_at',
        'admin_notes',
        'responded_at',
        'responded_by',
        'tailor_id',
        'tailor_status',
        'tailor_notes',
        'tailor_responded_at',
    ];

    protected $casts = [
        'measurements' => 'array',
        'estimated_price' => 'decimal:2',
        'responded_at' => 'datetime',
        'shipped_at' => 'datetime',
        'tailor_responded_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function respondedBy()
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    public function tailor()
    {
        return $this->belongsTo(User::class, 'tailor_id');
    }
}
