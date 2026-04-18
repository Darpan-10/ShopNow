const API = "http://localhost:5000/api";
let editId = null, curPage = 'dashboard';

/* ── Helpers ─────────────────────────────── */
const $ = id => document.getElementById(id);
const api = async (path, opts={}) => {
  const r = await fetch(API+path,{headers:{'Content-Type':'application/json'},...opts});
  return r.json();
};
const inr = n => '₹'+Number(n).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:0});
const esc = s => String(s).replace(/'/g,"\\'");

const STATUS_LIST = ['Placed','Confirmed','Shipped','Out for Delivery','Delivered'];
const STATUS_COLORS = {
  'Placed':'pill-gray','Confirmed':'pill-blue','Shipped':'pill-orange',
  'Out for Delivery':'pill-yellow','Delivered':'pill-green'
};

/* ── Toast Notification ─────────────────── */
let toastTimer = null;
function showToast(msg, duration = 2800) {
  const el = $('toast-msg');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

/* ── Navigation ──────────────────────────── */
const PAGE_TITLES = {
  dashboard:['Overview','Dashboard'], customers:['Customers','Store'],
  categories:['Categories','Store'], products:['Products','Store'],
  cart:['Shopping Cart','Shopping'], orders:['Orders','Shopping'],
  orderitems:['Order Items','Shopping'], history:['Purchase History','Tracking'],
  delivery:['Delivery Tracker','Tracking']
};
function showPage(name){
  document.querySelectorAll('.page-section').forEach(el=>el.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  $('page-'+name).classList.remove('hidden');
  $('page-'+name).style.animation='none';
  requestAnimationFrame(()=>{ $('page-'+name).style.animation=''; });
  const labels = {dashboard:'Overview',customers:'Customers',categories:'Categories',
    products:'Products',cart:'Cart',orders:'Orders',orderitems:'Order Items',
    history:'Purchase History',delivery:'Delivery Status'};
  document.querySelectorAll('.nav-item').forEach(t=>{
    if(t.textContent.trim().includes(labels[name]||'___')) t.classList.add('active');
  });
  const [title, sub] = PAGE_TITLES[name] || [name, ''];
  $('topbar-title').textContent = title;
  $('topbar-sub').textContent = sub;
  curPage = name;
  const loaders = {dashboard:loadDash,customers:loadCustomers,categories:loadCategories,
    products:loadProducts,cart:initCart,orders:loadOrders,orderitems:loadOrderItems,
    history:initHistory,delivery:loadDelivery};
  loaders[name]?.();
}

/* ── Filter ──────────────────────────────── */
function filterTable(tbId, val, cols){
  const rows = document.querySelectorAll(`#${tbId} tr`);
  const q = val.toLowerCase();
  rows.forEach(tr=>{
    const cells = tr.querySelectorAll('td');
    const match = !q || cols.some(i=>cells[i]?.textContent.toLowerCase().includes(q));
    tr.style.display = match ? '' : 'none';
  });
}

/* ── Modal helpers ───────────────────────── */
function openOverlay(id){ $('modal-wrap').classList.remove('hidden'); document.querySelectorAll('.overlay').forEach(o=>o.classList.add('hidden')); $('ov-'+id).classList.remove('hidden'); }
function closeAll(e){ if(!e||e.target===e.currentTarget||e.target.classList.contains('overlay')){ $('modal-wrap').classList.add('hidden'); editId=null; } }
function stop(e){ e.stopPropagation(); }

/* ── DASHBOARD ───────────────────────────── */
async function loadDash(){
  const s = await api('/stats');
  animateCount('s-customers', s.customers);
  animateCount('s-products',  s.products);
  animateCount('s-orders',    s.orders);
  $('s-revenue').textContent = inr(s.revenue);
  animateCount('s-cart', s.cartItems || 0);

  const orders = await api('/orders');
  const tb = $('d-orders-tb');
  if(!orders.length){ tb.innerHTML=emptyRow(4,'No orders yet'); return; }
  tb.innerHTML = orders.slice(0,5).map(o=>`
    <tr>
      <td><span class="pill pill-blue">ORD-${String(o.order_id).padStart(4,'0')}</span></td>
      <td>${o.customer_name}</td>
      <td class="mono">${o.order_date?.slice(0,10)}</td>
      <td><span class="pill ${STATUS_COLORS[o.delivery_status]||'pill-gray'}">${o.delivery_status||'Placed'}</span></td>
    </tr>`).join('');
}

function animateCount(id, target){
  const el = $(id); if(!el) return;
  let cur=0; const step=Math.max(1,Math.ceil(target/25));
  const t=setInterval(()=>{ cur=Math.min(cur+step,target); el.textContent=cur; if(cur>=target)clearInterval(t); },35);
}

/* ── CUSTOMERS ───────────────────────────── */
async function loadCustomers(){
  const rows = await api('/customers');
  $('c-count').textContent = rows.length+' customers registered';
  $('tb-customers').innerHTML = rows.length ? rows.map(c=>`
    <tr>
      <td><span class="id-chip">${c.customer_id}</span></td>
      <td style="font-weight:500">${c.name}</td>
      <td class="mono" style="color:var(--text2)">${c.email}</td>
      <td style="text-align:right">
        <button class="act-link act-edit" onclick="editCustomer(${c.customer_id},'${esc(c.name)}','${esc(c.email)}')">Edit</button>
        <span class="act-sep">|</span>
        <button class="act-link act-del" onclick="delCustomer(${c.customer_id})">Delete</button>
      </td>
    </tr>`).join('') : emptyRow(4,'No customers found');
}
function openModal(type){ editId=null; if(type==='customer'){$('mc-heading').textContent='Add Customer';$('mc-name').value='';$('mc-email').value='';} if(type==='category'){$('mcat-heading').textContent='Add Category';$('mcat-name').value='';} openOverlay(type); }
async function saveCustomer(){
  const name=$('mc-name').value.trim(), email=$('mc-email').value.trim();
  if(!name||!email) return showToast('Please fill all fields');
  if(editId) await api('/customers/'+editId,{method:'PUT',body:JSON.stringify({name,email})});
  else await api('/customers',{method:'POST',body:JSON.stringify({name,email})});
  closeAll(); loadCustomers();
  showToast(editId ? 'Customer updated' : 'Customer added');
}
function editCustomer(id,name,email){ editId=id; $('mc-heading').textContent='Edit Customer'; $('mc-name').value=name; $('mc-email').value=email; openOverlay('customer'); }
async function delCustomer(id){ if(!confirm('Remove this customer?')) return; await api('/customers/'+id,{method:'DELETE'}); loadCustomers(); showToast('Customer removed'); }

/* ── CATEGORIES ──────────────────────────── */
async function loadCategories(){
  const rows = await api('/categories');
  $('cat-count').textContent = rows.length+' categories';
  $('tb-categories').innerHTML = rows.length ? rows.map(c=>`
    <tr>
      <td><span class="id-chip">${c.category_id}</span></td>
      <td style="font-weight:500">${c.category_name}</td>
      <td style="text-align:right">
        <button class="act-link act-edit" onclick="editCategory(${c.category_id},'${esc(c.category_name)}')">Edit</button>
        <span class="act-sep">|</span>
        <button class="act-link act-del" onclick="delCategory(${c.category_id})">Delete</button>
      </td>
    </tr>`).join('') : emptyRow(3,'No categories found');
}
async function saveCategory(){
  const name=$('mcat-name').value.trim();
  if(!name) return showToast('Enter category name');
  if(editId) await api('/categories/'+editId,{method:'PUT',body:JSON.stringify({category_name:name})});
  else await api('/categories',{method:'POST',body:JSON.stringify({category_name:name})});
  closeAll(); loadCategories();
  showToast(editId ? 'Category updated' : 'Category added');
}
function editCategory(id,name){ editId=id; $('mcat-heading').textContent='Edit Category'; $('mcat-name').value=name; openOverlay('category'); }
async function delCategory(id){ if(!confirm('Delete this category?')) return; await api('/categories/'+id,{method:'DELETE'}); loadCategories(); showToast('Category removed'); }

/* ── PRODUCTS ────────────────────────────── */
async function loadProducts(){
  const rows = await api('/products');
  $('p-count').textContent = rows.length+' products listed';
  $('tb-products').innerHTML = rows.length ? rows.map(p=>`
    <tr>
      <td><span class="id-chip">${p.product_id}</span></td>
      <td style="font-weight:500">${p.name}</td>
      <td><span class="pill pill-gray">${p.category_name}</span></td>
      <td class="td-right" style="font-weight:600;color:var(--green)">${inr(p.price)}</td>
      <td style="text-align:right">
        <button class="act-link act-edit" onclick="editProduct(${p.product_id},'${esc(p.name)}',${p.price},${p.category_id})">Edit</button>
        <span class="act-sep">|</span>
        <button class="act-link act-del" onclick="delProduct(${p.product_id})">Delete</button>
      </td>
    </tr>`).join('') : emptyRow(5,'No products found');
}
async function openProductModal(){ const cats=await api('/categories'); $('mp-cat').innerHTML=cats.map(c=>`<option value="${c.category_id}">${c.category_name}</option>`).join(''); $('mp-heading').textContent='Add Product'; $('mp-name').value=''; $('mp-price').value=''; editId=null; openOverlay('product'); }
async function saveProduct(){
  const name=$('mp-name').value.trim(), price=$('mp-price').value, category_id=$('mp-cat').value;
  if(!name||!price) return showToast('Fill all fields');
  if(editId) await api('/products/'+editId,{method:'PUT',body:JSON.stringify({name,price,category_id})});
  else await api('/products',{method:'POST',body:JSON.stringify({name,price,category_id})});
  closeAll(); loadProducts();
  showToast(editId ? 'Product updated' : 'Product added');
}
async function editProduct(id,name,price,cat_id){ const cats=await api('/categories'); $('mp-cat').innerHTML=cats.map(c=>`<option value="${c.category_id}" ${c.category_id==cat_id?'selected':''}>${c.category_name}</option>`).join(''); $('mp-heading').textContent='Edit Product'; $('mp-name').value=name; $('mp-price').value=price; editId=id; openOverlay('product'); }
async function delProduct(id){ if(!confirm('Delete this product?')) return; await api('/products/'+id,{method:'DELETE'}); loadProducts(); showToast('Product removed'); }

/* ── CART ─────────────────────────────────── */
async function initCart(){
  const custs = await api('/customers');
  $('cart-cust').innerHTML = custs.map(c=>`<option value="${c.customer_id}">${c.name}</option>`).join('');
  loadCart();
}

async function loadCart(){
  const custId = $('cart-cust').value;
  if(!custId) return;
  const [products, cartItems] = await Promise.all([api('/products'), api('/cart/'+custId)]);

  // products table
  $('tb-cart-products').innerHTML = products.length ? products.map(p=>`
    <tr>
      <td><span class="id-chip">${p.product_id}</span></td>
      <td style="font-weight:500">${p.name}</td>
      <td><span class="pill pill-gray">${p.category_name}</span></td>
      <td class="td-right" style="font-weight:600;color:var(--green)">${inr(p.price)}</td>
      <td style="text-align:center"><button class="btn-cart" onclick="addToCart(${p.product_id})">+ Add</button></td>
    </tr>`).join('') : emptyRow(5,'No products available');

  // cart sidebar
  const list = $('cart-items-list');
  if(!cartItems.length){
    list.innerHTML = '<div style="color:var(--text3);font-size:12.5px;padding:10px 0;text-align:center">Cart is empty</div>';
    $('cart-subtotal').textContent = '₹0';
    $('cart-total').textContent = '₹0';
    return;
  }
  let total = 0;
  list.innerHTML = cartItems.map(i=>{
    const sub = i.price * i.quantity;
    total += sub;
    return `<div class="cart-item-mini">
      <span style="flex:1;font-weight:500">${i.product_name}</span>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="updateCartQty(${i.cart_id},${i.quantity-1})">−</button>
        <span class="qty-val">${i.quantity}</span>
        <button class="qty-btn" onclick="updateCartQty(${i.cart_id},${i.quantity+1})">+</button>
      </div>
      <span style="min-width:60px;text-align:right;font-weight:600;font-size:12px;color:var(--green)">${inr(sub)}</span>
      <button class="act-link act-del" onclick="removeFromCart(${i.cart_id})" style="font-size:11px">✕</button>
    </div>`;
  }).join('');
  $('cart-subtotal').textContent = inr(total);
  $('cart-total').textContent = inr(total);
}

async function addToCart(productId){
  const custId = $('cart-cust').value;
  await api('/cart',{method:'POST',body:JSON.stringify({customer_id:custId,product_id:productId,quantity:1})});
  loadCart();
  showToast('Added to cart');
}
async function updateCartQty(cartId, qty){
  await api('/cart/'+cartId,{method:'PUT',body:JSON.stringify({quantity:qty})});
  loadCart();
}
async function removeFromCart(cartId){
  await api('/cart/'+cartId,{method:'DELETE'});
  loadCart();
}
async function checkout(){
  const custId = $('cart-cust').value;
  if(!custId) return showToast('Select a customer');
  const res = await api('/cart/checkout/'+custId,{method:'POST'});
  if(res.error) return showToast(res.error);
  showToast('Order placed! ID: '+res.order_id);
  loadCart();
}

/* ── ORDERS ──────────────────────────────── */
async function loadOrders(){
  const rows = await api('/orders');
  $('o-count').textContent = rows.length+' orders placed';
  $('tb-orders').innerHTML = rows.length ? rows.map(o=>`
    <tr>
      <td><span class="pill pill-blue">ORD-${String(o.order_id).padStart(4,'0')}</span></td>
      <td style="font-weight:500">${o.customer_name}</td>
      <td class="mono">${o.order_date?.slice(0,10)}</td>
      <td><span class="pill ${STATUS_COLORS[o.delivery_status]||'pill-gray'}">${o.delivery_status||'Placed'}</span></td>
      <td style="text-align:right">
        <button class="act-link act-del" onclick="delOrder(${o.order_id})">Delete</button>
      </td>
    </tr>`).join('') : emptyRow(5,'No orders found');
}
async function openOrderModal(){ const custs=await api('/customers'); $('mo-cust').innerHTML=custs.map(c=>`<option value="${c.customer_id}">${c.name}</option>`).join(''); $('mo-date').value=new Date().toISOString().slice(0,10); openOverlay('order'); }
async function saveOrder(){ const customer_id=$('mo-cust').value, order_date=$('mo-date').value; if(!order_date) return showToast('Pick a date'); await api('/orders',{method:'POST',body:JSON.stringify({customer_id,order_date})}); closeAll(); loadOrders(); showToast('Order created'); }
async function delOrder(id){ if(!confirm('Delete this order and all its items?')) return; await api('/orders/'+id,{method:'DELETE'}); loadOrders(); showToast('Order deleted'); }

/* ── ORDER ITEMS ─────────────────────────── */
async function loadOrderItems(){
  const orders = await api('/orders');
  const tb = $('tb-orderitems');
  if(!orders.length){ tb.innerHTML=emptyRow(5,'No orders yet'); return; }
  let html='';
  for(const o of orders){
    const items = await api('/order-items/'+o.order_id);
    const total = items.reduce((s,i)=>s+(i.price*i.quantity),0);
    const lineItems = items.length ? items.map(i=>`
      <div class="sub-item-row">
        <span style="font-weight:500;flex:1">${i.product_name}</span>
        <span style="color:var(--text3);font-size:11px">× ${i.quantity}</span>
        <span style="color:var(--green);font-weight:600;min-width:70px;text-align:right">${inr(i.price*i.quantity)}</span>
        <button class="act-link act-del" style="margin-left:6px;font-size:11px" onclick="delItem(${i.item_id})">✕</button>
      </div>`).join('')
    : `<div style="color:var(--text3);font-size:12px;padding:4px 0">No items</div>`;
    html+=`<tr>
      <td><span class="pill pill-blue">ORD-${String(o.order_id).padStart(4,'0')}</span></td>
      <td style="font-weight:500">${o.customer_name}</td>
      <td class="mono">${o.order_date?.slice(0,10)}</td>
      <td><div style="min-width:250px">${lineItems}</div></td>
      <td class="td-right" style="font-weight:700;font-size:14px">${items.length?inr(total):'—'}</td>
    </tr>`;
  }
  tb.innerHTML = html;
}
async function openItemModal(){ const [orders,products]=await Promise.all([api('/orders'),api('/products')]); $('mi-order').innerHTML=orders.map(o=>`<option value="${o.order_id}">ORD-${String(o.order_id).padStart(4,'0')} — ${o.customer_name}</option>`).join(''); $('mi-prod').innerHTML=products.map(p=>`<option value="${p.product_id}">${p.name} (${inr(p.price)})</option>`).join(''); $('mi-qty').value=1; openOverlay('item'); }
async function saveItem(){ const order_id=$('mi-order').value, product_id=$('mi-prod').value, quantity=$('mi-qty').value; if(quantity<1) return showToast('Enter valid quantity'); await api('/order-items',{method:'POST',body:JSON.stringify({order_id,product_id,quantity})}); closeAll(); loadOrderItems(); showToast('Item added to order'); }
async function delItem(id){ if(!confirm('Remove this item?')) return; await api('/order-items/'+id,{method:'DELETE'}); loadOrderItems(); showToast('Item removed'); }

/* ── PURCHASE HISTORY ────────────────────── */
async function initHistory(){
  const custs = await api('/customers');
  $('hist-cust').innerHTML = custs.map(c=>`<option value="${c.customer_id}">${c.name}</option>`).join('');
  loadHistory();
}

async function loadHistory(){
  const custId = $('hist-cust').value;
  if(!custId){ $('history-list').innerHTML=''; return; }
  const orders = await api('/orders/history/'+custId);
  if(!orders.length){
    $('history-list').innerHTML = '<div class="card" style="padding:40px;text-align:center;color:var(--text3)"><div style="font-size:32px;margin-bottom:8px">📭</div>No purchase history found</div>';
    return;
  }
  $('history-list').innerHTML = orders.map(o=>`
    <div class="card" style="margin-bottom:12px">
      <div class="card-head">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="pill pill-blue">ORD-${String(o.order_id).padStart(4,'0')}</span>
          <span class="mono" style="color:var(--text3)">${o.order_date?.slice(0,10)}</span>
        </div>
        <span class="pill ${STATUS_COLORS[o.delivery_status]||'pill-gray'}">${o.delivery_status||'Placed'}</span>
      </div>
      <div style="padding:12px 18px">
        ${o.items.map(i=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0ece6;font-size:13px">
            <span style="font-weight:500">${i.product_name}</span>
            <span style="color:var(--text3)">× ${i.quantity}</span>
            <span style="font-weight:600;color:var(--green)">${inr(i.price*i.quantity)}</span>
          </div>`).join('')}
        <div style="display:flex;justify-content:flex-end;padding-top:10px;font-size:14px;font-weight:700">
          Total: <span style="margin-left:8px;color:var(--primary)">${inr(o.total)}</span>
        </div>
      </div>
    </div>`).join('');
}

/* ── DELIVERY STATUS ─────────────────────── */
async function loadDelivery(){
  const orders = await api('/orders');
  const tb = $('tb-delivery');
  if(!orders.length){ tb.innerHTML=emptyRow(6,'No orders yet'); return; }
  tb.innerHTML = orders.map(o=>{
    const current = o.delivery_status || 'Placed';
    const idx = STATUS_LIST.indexOf(current);
    const bars = STATUS_LIST.map((_,i)=>{
      let cls = 'progress-seg';
      if(i < idx) cls += ' filled';
      else if(i === idx) cls += ' current';
      return `<div class="${cls}"></div>`;
    }).join('');
    const opts = STATUS_LIST.map(s=>`<option value="${s}" ${s===current?'selected':''}>${s}</option>`).join('');
    return `<tr>
      <td><span class="pill pill-blue">ORD-${String(o.order_id).padStart(4,'0')}</span></td>
      <td style="font-weight:500">${o.customer_name}</td>
      <td class="mono">${o.order_date?.slice(0,10)}</td>
      <td><div class="progress-track">${bars}</div><div class="status-label">${current}</div></td>
      <td><span class="pill ${STATUS_COLORS[current]}">${current}</span></td>
      <td style="text-align:center"><select class="status-select" onchange="updateStatus(${o.order_id},this.value)">${opts}</select></td>
    </tr>`;
  }).join('');
}

async function updateStatus(orderId, status){
  await api('/orders/'+orderId+'/status',{method:'PUT',body:JSON.stringify({status})});
  loadDelivery();
  showToast('Delivery status updated');
}

/* ── Utility ─────────────────────────────── */
function emptyRow(cols, msg){ return `<tr><td colspan="${cols}"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">${msg}</div></div></td></tr>`; }

/* ── Init ────────────────────────────────── */
loadDash();
