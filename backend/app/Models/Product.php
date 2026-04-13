<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name','slug','description','details','price','stock','image','category_id','sizes'];

    // Accessor to always return absolute image URL
    protected $appends = ['image_url','thumbnail_url','sizes_array'];

    public function getImageUrlAttribute()
    {
        if (!$this->image) return null;
        // Already absolute
        if (preg_match('/^https?:\/\//i', $this->image)) return $this->image;
        // Build from app URL (handles /public path correctly)
        $base = rtrim(config('app.url'), '/');
        return $base . $this->image; // image already begins with /uploads/...
    }

    public function getThumbnailUrlAttribute()
    {
        if (!$this->image) return null;
        // Derive thumbnail path (thumbs subdirectory)
        $file = basename($this->image);
        $thumbRel = '/uploads/products/thumbs/' . $file;
        $full = rtrim(config('app.url'), '/') . $thumbRel;
        // If thumbnail doesn't exist, fallback to main image url
        if (!file_exists(public_path('uploads/products/thumbs/'.$file))) {
            return $this->image_url; // will call accessor
        }
        return $full;
    }

    public function getSizesArrayAttribute()
    {
        if (!$this->sizes) return [];
        if (is_array($this->sizes)) return $this->sizes;
        try {
            $decoded = json_decode($this->sizes, true);
            return is_array($decoded) ? $decoded : [];
        } catch (\Throwable $e) {
            return [];
        }
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
