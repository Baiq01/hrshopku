<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductController extends Controller
{
    // Public listing
    public function index(Request $request)
    {
        $query = Product::with('category');
        
        // Filter by category if provided
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        
    $paginated = $query->paginate(12);
    // Accessors like image_url will be appended automatically
    return response()->json($paginated);
    }

    public function show($id)
    {
        // Include category and variants for detailed page
        $p = Product::with(['category','variants'])->findOrFail($id);
        return response()->json($p);
    }

    // Admin methods (store/update/destroy)
    public function store(Request $request)
    {
        $data = $request->only(['name','slug','description','details','price','stock','image','category_id','sizes']);
        // Normalize sizes: accept comma string or array
        if ($request->has('sizes')) {
            $sizes = $request->input('sizes');
            if (is_string($sizes)) {
                // split by comma
                $sizes = array_filter(array_map(fn($s)=>trim($s), explode(',', $sizes)));
            }
            if (is_array($sizes)) {
                // validate allowed sizes
                $allowed = config('product.allowed_sizes');
                $norm = array_values(array_filter($sizes, fn($s)=> in_array(strtoupper($s), $allowed)));
                $data['sizes'] = json_encode($norm);
            }
        }
        
        // Variants payload (optional): variants=[{size,price,stock}]
        $variants = $request->input('variants');
        $p = Product::create($data);

        if (is_array($variants)) {
            foreach ($variants as $v) {
                if (!isset($v['size'])) continue;
                $size = strtoupper(trim($v['size']));
                if (!in_array($size, config('product.allowed_sizes'))) continue;
                $p->variants()->create([
                    'size' => $size,
                    'price' => isset($v['price']) ? (int)$v['price'] : null,
                    'stock' => isset($v['stock']) ? (int)$v['stock'] : null,
                ]);
            }
        }
    return response()->json($p,201);
    }

    public function update(Request $request, $id)
    {
        $p = Product::findOrFail($id);
        $updateData = $request->only(['name','slug','description','details','price','stock','image','category_id','sizes']);
        if ($request->has('sizes')) {
            $sizes = $request->input('sizes');
            if (is_string($sizes)) {
                $sizes = array_filter(array_map(fn($s)=>trim($s), explode(',', $sizes)));
            }
            if (is_array($sizes)) {
                $allowed = config('product.allowed_sizes');
                $norm = array_values(array_filter($sizes, fn($s)=> in_array(strtoupper($s), $allowed)));
                $updateData['sizes'] = json_encode($norm);
            }
        }
        $p->update($updateData);

        // Sync variants
        if ($request->has('variants')) {
            $variants = $request->input('variants');
            if (is_array($variants)) {
                $keepIds = [];
                foreach ($variants as $v) {
                    if (!isset($v['size'])) continue;
                    $size = strtoupper(trim($v['size']));
                    if (!in_array($size, config('product.allowed_sizes'))) continue;
                    $existing = $p->variants()->where('size',$size)->first();
                    $payload = [
                        'price' => isset($v['price']) ? (int)$v['price'] : null,
                        'stock' => isset($v['stock']) ? (int)$v['stock'] : null,
                    ];
                    if ($existing) {
                        $existing->update($payload);
                        $keepIds[] = $existing->id;
                    } else {
                        $new = $p->variants()->create(array_merge(['size'=>$size], $payload));
                        $keepIds[] = $new->id;
                    }
                }
                // Delete removed variants
                if (!empty($keepIds)) {
                    $p->variants()->whereNotIn('id',$keepIds)->delete();
                } else {
                    $p->variants()->delete();
                }
            }
        }
    return response()->json($p);
    }

    public function destroy($id)
    {
        $p = Product::findOrFail($id);
        $p->delete();
        return response()->json(['deleted'=>true]);
    }

    // Upload/replace product image (admin)
    public function uploadImage(Request $request, $id)
    {
        $p = Product::findOrFail($id);
        if (!$request->hasFile('image')) {
            return response()->json(['error'=>'No image uploaded'], 422);
        }

        $file = $request->file('image');
        if (!$file->isValid()) {
            return response()->json(['error'=>'Invalid file'], 422);
        }

        $ext = $file->getClientOriginalExtension() ?: 'jpg';
        $name = 'product_'.$p->id.'_'.time().'.'.$ext;
        $dest = public_path('uploads/products');
        if (!is_dir($dest)) {
            @mkdir($dest, 0775, true);
        }
        $file->move($dest, $name);

        $relativePath = '/uploads/products/'.$name;
        // Generate thumbnail 400px wide (proportional)
        try {
            $thumbDir = public_path('uploads/products/thumbs');
            if (!is_dir($thumbDir)) {
                @mkdir($thumbDir, 0775, true);
            }
            $thumbPath = $thumbDir.'/'.$name;
            // Use Intervention Image (v3)
            $manager = new ImageManager(new Driver());
            $img = $manager->read($dest.'/'.$name);
            // Resize maintaining aspect ratio, max width 400px
            // Intervention Image v3 uses cover/resize with different signature.
            try {
                if (method_exists($img, 'scaleDown')) {
                    $img->scaleDown(400);
                } elseif (method_exists($img, 'resize')) {
                    // Fallback: simple proportional resize keeping aspect by width
                    $img->resize(width:400);
                }
            } catch (\Throwable $ie) {
                // Ignore if resize fails
            }
            $img->save($thumbPath);
        } catch (\Throwable $e) {
            // Log silently; thumbnail optional
            Log::warning('Thumbnail generation failed: '.$e->getMessage());
        }

        // Store absolute URL for convenience
        $p->image = url($relativePath);
        $p->save();

    return response()->json($p);
    }
}
