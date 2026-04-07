const KEY = 'hr_cart';

export function getCart(){
  try{
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

function save(cart){
  localStorage.setItem(KEY, JSON.stringify(cart));
  try{ window.dispatchEvent(new Event('cart_updated')); }catch{}
}

export function addItem(product, qty=1, options={}){
  const cart = getCart();
  const id = product.id || product.product_id;
  if (!id) return cart;
  const size = options.size || product.size || null;
  const keyMatch = (i)=> i.product_id===id && (i.size||null) === (size||null);
  const idx = cart.findIndex(keyMatch);
  if (idx>=0){
    cart[idx].quantity = (cart[idx].quantity||0) + qty;
  } else {
    cart.push({ product_id: id, name: product.name, price: product.price, quantity: Math.max(1, qty), size });
  }
  save(cart);
  return cart;
}

export function updateQty(product_id, qty, options={}){
  let cart = getCart();
  const size = options.size || null;
  cart = cart.map(i=> (i.product_id===product_id && (i.size||null)===(size||null)) ? { ...i, quantity: Math.max(0, parseInt(qty||0)) } : i);
  cart = cart.filter(i=> (i.quantity||0) > 0);
  save(cart);
  return cart;
}

export function removeItem(product_id, options={}){
  const size = options.size || null;
  let cart = getCart().filter(i=> !(i.product_id===product_id && (i.size||null)===(size||null)) );
  save(cart);
  return cart;
}

export function clearCart(){
  save([]);
  return [];
}

export function totalItems(){
  return getCart().reduce((a,b)=>a + (b.quantity||0), 0);
}

export function totalAmount(){
  return getCart().reduce((a,b)=>a + (b.quantity||0) * (b.price||0), 0);
}

export default { getCart, addItem, updateQty, removeItem, clearCart, totalItems, totalAmount };
