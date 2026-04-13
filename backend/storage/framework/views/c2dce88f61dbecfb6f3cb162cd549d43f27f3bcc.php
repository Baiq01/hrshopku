<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Selamat Datang</title>
    <style>
      body { font-family: Arial, sans-serif; background:#f7f7f7; margin:0; padding:0; }
      .card { max-width:600px; margin:24px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08); }
      .header { background:linear-gradient(90deg,#e11d48,#db2777); color:#fff; padding:20px; }
      .content { padding:24px; color:#111827; }
      .btn { display:inline-block; padding:10px 16px; background:#e11d48; color:#fff !important; text-decoration:none; border-radius:8px; }
      .footer { padding:16px; font-size:12px; color:#6b7280; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h2 style="margin:0">Selamat Datang di HRSHOPKU</h2>
      </div>
      <div class="content">
        <p>Halo <strong><?php echo e($userName); ?></strong>,</p>
        <p>Terima kasih telah mendaftar di HRSHOPKU. Kami senang menyambut Anda! Nikmati koleksi Baju Bodo dengan kualitas terbaik.</p>
        <p>Jika Anda butuh bantuan, balas email ini atau kunjungi halaman bantuan kami.</p>
        <p>
          <a class="btn" href="<?php echo e(config('app.url')); ?>" target="_blank">Kunjungi Toko</a>
        </p>
      </div>
      <div class="footer">
        <p>Email ini dikirim otomatis, mohon tidak membalas.</p>
        <p>&copy; <?php echo e(date('Y')); ?> HRSHOPKU</p>
      </div>
    </div>
  </body>
</html>
<?php /**PATH C:\Users\USER\Documents\Cooding Projects\TESTING\hrshopku\backend\resources\views/emails/registration_welcome.blade.php ENDPATH**/ ?>