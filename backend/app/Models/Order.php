<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number','total_amount','status','items','midtrans_token','midtrans_transaction_id','user_id',
        'customer_name','customer_phone','shipping_address','shipping_city','shipping_province','shipping_postal_code','shipping_method','shipping_cost','tracking_number','courier'
    ];

    protected $casts = [
        'items' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
