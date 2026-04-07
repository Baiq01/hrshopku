// Utility untuk update semua file dengan toast
// File ini hanya dokumentasi, sudah diintegrasikan ke komponen

/**
 * CHANGELOG - Alert ke Toast Migration
 * 
 * 1. Toast Component (components/Toast.jsx) ✅
 *    - success, error, warning, info
 *    - Auto-hide dengan duration
 *    - Close button
 *    - Slide-in animation
 * 
 * 2. ConfirmDialog Component (components/ConfirmDialog.jsx) ✅
 *    - Menggantikan window.confirm()
 *    - Async/await support
 *    - Type: warning, danger, info
 *    - Custom buttons
 * 
 * 3. Files Updated:
 *    - TailorDashboard.jsx ✅ (toast + custom modal for notes)
 *    - AdminCustomOrders.jsx ✅ (toast + confirm dialog)
 *    - CustomOrder.jsx ✅ (toast + confirm dialog)
 * 
 * 4. Remaining Files (Auto-update via global import):
 *    - Register.jsx
 *    - Login.jsx (admin)
 *    - Products.jsx (admin)
 *    - Orders.jsx (admin)
 *    - OrderDetail.jsx (admin)
 *    - Cart.jsx
 *    - Checkout.jsx
 *    - MyOrders.jsx
 *    - MyCustomOrders.jsx
 *    - Categories.jsx (admin)
 *    - ProductDetail.jsx
 *    - ProductEdit.jsx (admin)
 * 
 * USAGE:
 * import { useToast } from '../components/Toast';
 * import { useConfirm } from '../components/ConfirmDialog';
 * 
 * const toast = useToast();
 * const { confirm } = useConfirm();
 * 
 * // Toast
 * toast.success('Berhasil!');
 * toast.error('Gagal!');
 * toast.warning('Perhatian!');
 * toast.info('Informasi');
 * 
 * // Confirm
 * const result = await confirm({
 *   title: 'Hapus Item',
 *   message: 'Yakin ingin menghapus?',
 *   type: 'danger', // warning, danger, info
 *   confirmText: 'Hapus',
 *   cancelText: 'Batal'
 * });
 * 
 * if (result) {
 *   // User clicked confirm
 * }
 */

export const TOAST_MIGRATION_GUIDE = {
  alert: 'toast.info() atau toast.error()',
  'window.confirm': 'await confirm({ ... })',
  'window.location.href': 'navigate()',
};
