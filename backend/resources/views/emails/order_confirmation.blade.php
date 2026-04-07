<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Konfirmasi Order</title>
    <style>
      body { font-family: Arial, sans-serif; background:#f7f7f7; margin:0; padding:0; }
      .card { max-width:720px; margin:24px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08); }
      .header { background:linear-gradient(90deg,#e11d48,#db2777); color:#fff; padding:24px; text-align:center; }
      .header h2 { margin:0 0 8px 0; font-size:24px; }
      .header .order-number { background:rgba(255,255,255,0.2); padding:6px 16px; border-radius:20px; font-size:14px; display:inline-block; }
      .content { padding:28px; color:#111827; }
      .greeting { font-size:18px; color:#374151; margin-bottom:16px; }
      .highlight-box { background:linear-gradient(135deg,#fdf2f8,#fce7f3); border-left:4px solid #e11d48; padding:16px 20px; border-radius:0 12px 12px 0; margin:20px 0; }
      .highlight-box p { margin:0; line-height:1.7; color:#1f2937; }
      .table { width:100%; border-collapse:collapse; margin-top:20px; border-radius:8px; overflow:hidden; }
      .table th { background:#fdf2f8; color:#be185d; padding:12px; text-align:left; font-size:13px; text-transform:uppercase; letter-spacing:0.5px; }
      .table td { border-bottom:1px solid #f3e8ff; padding:12px; font-size:14px; }
      .table tr:last-child td { border-bottom:none; }
      .total-row { background:#fdf2f8; }
      .total-row td { font-weight:bold; color:#be185d; }
      .shipping-info { background:#f9fafb; border-radius:12px; padding:16px; margin-top:20px; }
      .shipping-info h4 { margin:0 0 12px 0; color:#374151; font-size:14px; display:flex; align-items:center; gap:8px; }
      .shipping-info p { margin:4px 0; font-size:14px; color:#6b7280; }
      .status-badge { display:inline-block; background:#fef3c7; color:#d97706; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:600; margin-top:16px; }
      .cta-button { display:inline-block; background:linear-gradient(90deg,#e11d48,#db2777); color:#fff !important; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600; margin-top:20px; }
      .footer { padding:20px; font-size:12px; color:#6b7280; text-align:center; background:#fafafa; border-top:1px solid #f3f4f6; }
      .footer a { color:#e11d48; text-decoration:none; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h2>🛍️ Pesanan Berhasil!</h2>
        <span class="order-number">No. Order: {{ $order->order_number }}</span>
      </div>
      <div class="content">
        @php
          $customerName = $order->customer_name ?? optional($order->user)->name ?? 'Pelanggan';
          $totalQty = collect($order->items ?? [])->sum('quantity');
          $productNames = collect($order->items ?? [])->pluck('name')->implode(', ');
        @endphp
        
        <p class="greeting">Halo, <strong>{{ $customerName }}</strong>! 👋</p>
        
        <div class="highlight-box">
          <p>
            Terima kasih telah memesan <strong>{{ $productNames }}</strong>. 
            Jumlah: <strong>{{ $totalQty }} pcs</strong>. 
            Total Pembayaran: <strong>Rp {{ number_format((int)$order->total_amount,0,',','.') }}</strong>.
            <br><br>
            🎉 <em>Pesanan Anda sedang diproses dan akan segera dikirim!</em>
          </p>
        </div>

        <h3 style="color:#374151; margin-bottom:8px;">📦 Detail Pesanan</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Ukuran</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
          @foreach(($order->items ?? []) as $it)
            <tr>
              <td>{{ $it['name'] ?? '-' }}</td>
              <td>{{ $it['size'] ?? '-' }}</td>
              <td>{{ $it['quantity'] ?? 1 }}</td>
              <td>Rp {{ number_format((int)($it['price'] ?? 0) * (int)($it['quantity'] ?? 1),0,',','.') }}</td>
            </tr>
          @endforeach
            <tr>
              <td colspan="3">Ongkos Kirim ({{ $order->courier ?? '-' }} {{ $order->shipping_method ?? '' }})</td>
              <td>Rp {{ number_format((int)$order->shipping_cost,0,',','.') }}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3"><strong>Total Pembayaran</strong></td>
              <td><strong>Rp {{ number_format((int)$order->total_amount,0,',','.') }}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="shipping-info">
          <h4>📍 Alamat Pengiriman</h4>
          <p><strong>{{ $customerName }}</strong></p>
          <p>{{ $order->customer_phone ?? '-' }}</p>
          <p>{{ $order->shipping_address }}</p>
          <p>{{ $order->shipping_city }}, {{ $order->shipping_province }} {{ $order->shipping_postal_code }}</p>
        </div>

        <div style="text-align:center; margin-top:24px;">
          <span class="status-badge">⏳ Menunggu Pembayaran</span>
          <p style="font-size:14px; color:#6b7280; margin-top:12px;">
            Jika pembayaran belum selesai, silakan lanjutkan melalui aplikasi kami.
          </p>
          <a class="cta-button" href="{{ config('app.url') }}/my-orders" target="_blank">
            Lihat Status Pesanan
          </a>
        </div>
      </div>
      <div class="footer">
        <p>Ada pertanyaan? Hubungi kami di <a href="https://wa.me/6281244586514">WhatsApp</a> atau <a href="https://instagram.com/hrshopku">Instagram @hrshopku</a></p>
        <p>Email ini dikirim otomatis, mohon tidak membalas langsung.</p>
        <p>&copy; {{ date('Y') }} <strong>HRSHOPKU</strong> - Baju Bodo Berkualitas</p>
      </div>
    </div>
  </body>
</html>
