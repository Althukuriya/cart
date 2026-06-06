/**
 * ═══════════════════════════════════════════════════════
 * ShopCraft eCommerce - Google Apps Script Backend
 * ═══════════════════════════════════════════════════════
 *
 * DEPLOYMENT INSTRUCTIONS:
 *
 * 1. Create a Google Sheet (or use an existing one)
 * 2. Get the Sheet ID from the URL:
 *    https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 * 3. Go to https://script.google.com → New Project
 * 4. Paste this ENTIRE code into the script editor
 * 5. Replace SPREADSHEET_ID below with your Sheet ID
 * 6. Run → setupSampleData() once to create sheets + sample data
 * 7. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 8. Copy the deployment URL into src/lib/api.ts API_BASE
 *
 * SHEET STRUCTURE (auto-created by setupSampleData):
 * ─────────────────────────────────────────────────────
 * Products:  id | sku | name | slug | description | price |
 *            comparePrice | stock | images | category |
 *            featured | status | shippingInfo | returnPolicy |
 *            createdAt | updatedAt
 *
 * Categories: id | name | slug | description | image | sort_order
 *
 * Orders:    id | orderId | orderDate | customerName | phone |
 *            altPhone | email | address | landmark | city |
 *            state | pincode | items | totalAmount | status |
 *            createdAt | updatedAt
 *
 * Admin:     id | email | password | name
 *
 * Settings:  key | value  (key-value pairs for site configuration)
 * ─────────────────────────────────────────────────────
 */

// ⚠️ PASTE YOUR SPREADSHEET ID HERE
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const ADMIN_KEY = 'shopcraft-admin-key-2024';

// ─── Request Handling ──────────────────────────────────

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  let action = '';
  let payload = {};

  if (method === 'GET') {
    action = e.parameter.action || '';
    payload = e.parameter;
  } else {
    action = e.parameter.action || '';
    if (e.postData && e.postData.contents) {
      try {
        const parsed = JSON.parse(e.postData.contents);
        action = action || parsed.action || '';
        payload = parsed;
      } catch (err) {}
    }
    if (!action && e.parameter.action) {
      action = e.parameter.action;
    }
    if (e.parameter.payload) {
      try {
        payload = JSON.parse(e.parameter.payload);
      } catch (err) {
        payload = {};
      }
    }
  }

  let result;
  try {
    switch (action) {
      // Products
      case 'getProducts':         result = getProducts(); break;
      case 'getProductsByCategory': result = getProductsByCategory(payload.category); break;
      case 'searchProducts':     result = searchProducts(payload.query); break;
      case 'addProduct':         result = addProduct(payload); break;
      case 'updateProduct':      result = updateProduct(payload); break;
      case 'deleteProduct':      result = deleteProduct(payload); break;

      // Categories
      case 'getCategories':      result = getCategories(); break;
      case 'addCategory':        result = addCategory(payload); break;
      case 'updateCategory':     result = updateCategory(payload); break;
      case 'deleteCategory':     result = deleteCategory(payload); break;

      // Orders
      case 'createOrder':        result = createOrder(payload); break;
      case 'getOrders':          result = getOrders(payload); break;
      case 'getOrdersByEmail':   result = getOrdersByEmail(payload.email); break;
      case 'getOrder':           result = getOrder(payload.orderId); break;
      case 'updateOrderStatus':  result = updateOrderStatus(payload); break;

      // Auth
      case 'adminLogin':         result = adminLogin(payload); break;

      // Settings
      case 'getSettings':        result = getSettings(); break;
      case 'updateSettings':     result = updateSettingsAction(payload); break;

      default:
        result = { status: 'error', message: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Sheet Helpers ─────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    switch (name) {
      case 'Products':
        sheet.appendRow(['id','sku','name','slug','description','price','comparePrice','stock','images','category','featured','status','shippingInfo','returnPolicy','createdAt','updatedAt']);
        break;
      case 'Categories':
        sheet.appendRow(['id','name','slug','description','image','sort_order']);
        break;
      case 'Orders':
        sheet.appendRow(['id','orderId','orderDate','customerName','phone','altPhone','email','address','landmark','city','state','pincode','items','totalAmount','status','createdAt','updatedAt']);
        break;
      case 'Admin':
        sheet.appendRow(['id','email','password','name']);
        sheet.appendRow([Utilities.getUuid(), 'admin@store.com', 'admin123', 'Store Admin']);
        break;
      case 'Settings':
        sheet.appendRow(['key', 'value']);
        break;
    }
  }
  return sheet;
}

function sheetToArray(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function verifyAdmin(payload) {
  if (payload.adminKey !== ADMIN_KEY) {
    throw new Error('Unauthorized: invalid admin key');
  }
}

function slugify(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Products ──────────────────────────────────────────

function getProducts() {
  const sheet = getSheet('Products');
  const products = sheetToArray(sheet);
  return { status: 'success', data: products.map(formatProduct) };
}

function getProductsByCategory(category) {
  const sheet = getSheet('Products');
  const products = sheetToArray(sheet);
  const filtered = products.filter(p =>
    p.category && p.category.toLowerCase() === String(category).toLowerCase() && p.status === 'active'
  );
  return { status: 'success', data: filtered.map(formatProduct) };
}

function searchProducts(query) {
  if (!query) return getProducts();
  const sheet = getSheet('Products');
  const products = sheetToArray(sheet);
  const q = String(query).toLowerCase();
  const filtered = products.filter(p =>
    (p.name && String(p.name).toLowerCase().includes(q)) ||
    (p.description && String(p.description).toLowerCase().includes(q)) ||
    (p.sku && String(p.sku).toLowerCase().includes(q))
  );
  return { status: 'success', data: filtered.map(formatProduct) };
}

function addProduct(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Products');
  const product = payload.product || payload;
  const id = product.id || Utilities.getUuid();
  const slug = product.slug || slugify(product.name);
  const now = new Date().toISOString();
  const images = Array.isArray(product.images) ? product.images.join('|') : (product.images || '');

  sheet.appendRow([
    id, product.sku || '', product.name || '', slug,
    product.description || '', Number(product.price) || 0,
    Number(product.comparePrice) || 0, Number(product.stock) || 0,
    images, product.category || '',
    product.featured ? 'TRUE' : 'FALSE', product.status || 'active',
    product.shippingInfo || 'Free delivery within 5-7 business days',
    product.returnPolicy || '7-day easy returns', now, now
  ]);

  SpreadsheetApp.flush();
  return { status: 'success', data: { id: id } };
}

function updateProduct(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Products');
  const productId = payload.productId;
  const updates = payload.updates || {};
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === productId) {
      const now = new Date().toISOString();
      Object.keys(updates).forEach(key => {
        const colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          let val = updates[key];
          if (key === 'images' && Array.isArray(val)) val = val.join('|');
          if (key === 'featured') val = val ? 'TRUE' : 'FALSE';
          sheet.getRange(i + 1, colIdx + 1).setValue(val);
        }
      });
      const updatedAtCol = headers.indexOf('updatedAt');
      if (updatedAtCol !== -1) sheet.getRange(i + 1, updatedAtCol + 1).setValue(now);
      SpreadsheetApp.flush();
      return { status: 'success', data: { success: true } };
    }
  }
  throw new Error('Product not found: ' + productId);
}

function deleteProduct(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Products');
  const productId = payload.productId;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === productId) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { status: 'success', data: { success: true } };
    }
  }
  throw new Error('Product not found: ' + productId);
}

function formatProduct(p) {
  return {
    id: p.id, sku: p.sku || '', name: p.name || '', slug: p.slug || '',
    description: p.description || '', price: Number(p.price) || 0,
    comparePrice: Number(p.comparePrice) || 0, stock: Number(p.stock) || 0,
    images: p.images ? String(p.images).split('|').filter(Boolean) : [],
    category: p.category || '',
    featured: p.featured === 'TRUE' || p.featured === true,
    status: p.status || 'active', shippingInfo: p.shippingInfo || '',
    returnPolicy: p.returnPolicy || '', createdAt: p.createdAt || '',
    updatedAt: p.updatedAt || ''
  };
}

// ─── Categories ────────────────────────────────────────

function getCategories() {
  const sheet = getSheet('Categories');
  const categories = sheetToArray(sheet);
  return {
    status: 'success',
    data: categories.map(c => ({
      id: c.id, name: c.name || '', slug: c.slug || '',
      description: c.description || '', image: c.image || '',
      sort_order: Number(c.sort_order) || 0
    }))
  };
}

function addCategory(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Categories');
  const category = payload.category || payload;
  const id = category.id || Utilities.getUuid();
  const slug = category.slug || slugify(category.name);

  sheet.appendRow([id, category.name || '', slug, category.description || '', category.image || '', Number(category.sort_order) || 0]);
  SpreadsheetApp.flush();
  return { status: 'success', data: { id: id } };
}

function updateCategory(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Categories');
  const categoryId = payload.categoryId;
  const updates = payload.updates || {};
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === categoryId) {
      Object.keys(updates).forEach(key => {
        const colIdx = headers.indexOf(key);
        if (colIdx !== -1) sheet.getRange(i + 1, colIdx + 1).setValue(updates[key]);
      });
      SpreadsheetApp.flush();
      return { status: 'success', data: { success: true } };
    }
  }
  throw new Error('Category not found: ' + categoryId);
}

function deleteCategory(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Categories');
  const categoryId = payload.categoryId;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === categoryId) {
      sheet.deleteRow(i + 1);
      SpreadsheetApp.flush();
      return { status: 'success', data: { success: true } };
    }
  }
  throw new Error('Category not found: ' + categoryId);
}

// ─── Orders ───────────────────────────────────────────

function createOrder(payload) {
  const sheet = getSheet('Orders');
  const id = Utilities.getUuid();
  const orderId = payload.orderId || ('ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase());
  const now = new Date().toISOString();
  const items = Array.isArray(payload.items) ? JSON.stringify(payload.items) : (payload.items || '[]');

  sheet.appendRow([
    id, orderId, now, payload.customerName || '', payload.phone || '',
    payload.altPhone || '', payload.email || '', payload.address || '',
    payload.landmark || '', payload.city || '', payload.state || '',
    payload.pincode || '', items, Number(payload.totalAmount) || 0,
    payload.status || 'placed', now, now
  ]);

  SpreadsheetApp.flush();
  sendOrderNotification(orderId, payload);
  return { status: 'success', data: { orderId: orderId } };
}

function getOrders(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Orders');
  const orders = sheetToArray(sheet);
  return { status: 'success', data: orders.map(formatOrder) };
}

function getOrdersByEmail(email) {
  const sheet = getSheet('Orders');
  const orders = sheetToArray(sheet);
  const filtered = orders.filter(o => o.email === email);
  return { status: 'success', data: filtered.map(formatOrder) };
}

function getOrder(orderId) {
  const sheet = getSheet('Orders');
  const orders = sheetToArray(sheet);
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return { status: 'success', data: null };
  return { status: 'success', data: formatOrder(order) };
}

function updateOrderStatus(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Orders');
  const orderId = payload.orderId;
  const status = payload.status;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const orderIdCol = headers.indexOf('orderId');
  const statusCol = headers.indexOf('status');
  const updatedAtCol = headers.indexOf('updatedAt');

  for (let i = 1; i < data.length; i++) {
    if (data[i][orderIdCol] === orderId) {
      sheet.getRange(i + 1, statusCol + 1).setValue(status);
      sheet.getRange(i + 1, updatedAtCol + 1).setValue(new Date().toISOString());
      SpreadsheetApp.flush();
      const emailCol = headers.indexOf('email');
      const customerEmail = data[i][emailCol];
      const nameCol = headers.indexOf('customerName');
      const customerName = data[i][nameCol];
      if (customerEmail) sendStatusEmail(orderId, customerEmail, customerName, status);
      return { status: 'success', data: { success: true } };
    }
  }
  throw new Error('Order not found: ' + orderId);
}

function formatOrder(o) {
  let items = [];
  try {
    items = typeof o.items === 'string' ? JSON.parse(o.items) : (Array.isArray(o.items) ? o.items : []);
  } catch (e) { items = []; }
  return {
    id: o.id, orderId: o.orderId || '', orderDate: o.orderDate || o.createdAt || '',
    customerName: o.customerName || '', phone: o.phone || '', altPhone: o.altPhone || '',
    email: o.email || '', address: o.address || '', landmark: o.landmark || '',
    city: o.city || '', state: o.state || '', pincode: o.pincode || '',
    items: items, totalAmount: Number(o.totalAmount) || 0, status: o.status || 'placed',
    createdAt: o.createdAt || '', updatedAt: o.updatedAt || ''
  };
}

// ─── Auth ──────────────────────────────────────────────

function adminLogin(payload) {
  const email = payload.email || '';
  const password = payload.password || '';
  const sheet = getSheet('Admin');
  const admins = sheetToArray(sheet);
  const admin = admins.find(a => a.email === email && a.password === password);
  if (!admin) return { status: 'error', message: 'Invalid email or password' };
  return { status: 'success', data: { adminId: admin.id, name: admin.name, email: admin.email } };
}

// ─── Site Settings ─────────────────────────────────────

function getSettings() {
  const sheet = getSheet('Settings');
  const rows = sheetToArray(sheet);
  const settings = {};
  rows.forEach(row => {
    if (row.key) settings[row.key] = row.value;
  });
  return { status: 'success', data: settings };
}

function updateSettingsAction(payload) {
  verifyAdmin(payload);
  const sheet = getSheet('Settings');
  const settings = payload.settings || {};
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyCol = headers.indexOf('key');
  const valueCol = headers.indexOf('value');

  // Build map of existing keys to row numbers
  const existingKeys = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyCol]) existingKeys[data[i][keyCol]] = i + 1; // row number (1-indexed)
  }

  // Update existing or add new
  Object.keys(settings).forEach(key => {
    const value = typeof settings[key] === 'object' ? JSON.stringify(settings[key]) : String(settings[key] || '');
    if (existingKeys[key]) {
      // Update existing row
      sheet.getRange(existingKeys[key], valueCol + 1).setValue(value);
    } else {
      // Add new row
      sheet.appendRow([key, value]);
    }
  });

  SpreadsheetApp.flush();
  return { status: 'success', data: { success: true } };
}

// ─── Email Notifications ───────────────────────────────

function sendOrderNotification(orderId, order) {
  try {
    const ownerEmail = getSettingValue('ownerEmail') || 'althukuriya83@gmail.com';
    const itemsHtml = Array.isArray(order.items)
      ? order.items.map(item =>
          '<tr><td style="padding:6px;border-bottom:1px solid #eee">' + (item.productName || item.product_name) +
          '</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:center">' + item.quantity +
          '</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">\u20B9' +
          (item.price * item.quantity).toLocaleString('en-IN') + '</td></tr>'
        ).join('')
      : '';

    const htmlBody = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
      '<div style="background:#059669;padding:20px;text-align:center"><h1 style="color:white;margin:0">New Order!</h1></div>' +
      '<div style="padding:20px;background:#f9fafb">' +
      '<h2 style="color:#111827">Order: ' + orderId + '</h2>' +
      '<table style="width:100%;font-size:14px;margin-bottom:16px">' +
      '<tr><td style="color:#6b7280;padding:4px 0;width:140px">Name</td><td style="color:#111827;font-weight:600">' + (order.customerName || '') + '</td></tr>' +
      '<tr><td style="color:#6b7280;padding:4px 0">Phone</td><td style="color:#111827">' + (order.phone || '') + '</td></tr>' +
      '<tr><td style="color:#6b7280;padding:4px 0">Email</td><td style="color:#111827">' + (order.email || '') + '</td></tr>' +
      '<tr><td style="color:#6b7280;padding:4px 0">Address</td><td style="color:#111827">' + (order.address || '') + ', ' + (order.city || '') + ', ' + (order.state || '') + ' - ' + (order.pincode || '') + '</td></tr>' +
      '</table>' +
      '<table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden">' +
      '<thead><tr style="background:#f3f4f6"><th style="padding:8px;text-align:left">Product</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Amount</th></tr></thead>' +
      '<tbody>' + itemsHtml + '</tbody>' +
      '<tfoot><tr style="background:#f3f4f6"><td style="padding:8px;font-weight:bold" colspan="2">Total</td><td style="padding:8px;text-align:right;font-weight:bold">\u20B9' + Number(order.totalAmount || 0).toLocaleString('en-IN') + '</td></tr></tfoot>' +
      '</table>' +
      '<div style="margin-top:16px;padding:12px;background:#d1fae5;border-radius:8px;text-align:center"><strong style="color:#059669">Cash on Delivery</strong></div>' +
      '</div></div>';

    MailApp.sendEmail({ to: ownerEmail, subject: 'New Order: ' + orderId, htmlBody: htmlBody });

    if (order.email) {
      MailApp.sendEmail({
        to: order.email,
        subject: 'Order Confirmed: ' + orderId,
        htmlBody: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
          '<div style="background:#059669;padding:20px;text-align:center"><h1 style="color:white;margin:0">Order Confirmed!</h1></div>' +
          '<div style="padding:20px;background:#f9fafb">' +
          '<p>Hi ' + (order.customerName || 'Customer') + ',</p>' +
          '<p>Thank you for your order! Your order ID is <strong>' + orderId + '</strong>.</p>' +
          '<p>Total: <strong>\u20B9' + Number(order.totalAmount || 0).toLocaleString('en-IN') + '</strong> (Cash on Delivery)</p>' +
          '<p style="color:#6b7280;font-size:14px">Track your order using the Order ID on our website.</p>' +
          '</div></div>'
      });
    }
  } catch (err) {
    console.error('Email notification failed:', err);
  }
}

function sendStatusEmail(orderId, email, name, status) {
  try {
    const statusLabels = {
      placed: 'Your order has been placed!',
      confirmed: 'Your order has been confirmed!',
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.'
    };
    const label = statusLabels[status] || 'Your order status has been updated.';

    MailApp.sendEmail({
      to: email,
      subject: 'Order Update: ' + orderId + ' - ' + status.toUpperCase(),
      htmlBody: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">' +
        '<div style="background:#059669;padding:20px;text-align:center"><h1 style="color:white;margin:0">Order Update</h1></div>' +
        '<div style="padding:20px;background:#f9fafb;text-align:center">' +
        '<p>Hi ' + (name || 'Customer') + ',</p>' +
        '<p style="font-size:18px;font-weight:bold;color:#111827">' + label + '</p>' +
        '<p>Order ID: <strong>' + orderId + '</strong></p>' +
        '<p>Status: <strong style="color:#059669">' + status.toUpperCase() + '</strong></p>' +
        '</div></div>'
    });
  } catch (err) {
    console.error('Status email failed:', err);
  }
}

// Helper: read a single setting value
function getSettingValue(key) {
  try {
    const sheet = getSheet('Settings');
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) return data[i][1];
    }
  } catch (e) {}
  return null;
}

// ─── Setup: Run once to populate with sample data ──────

function setupSampleData() {
  // Categories
  const catSheet = getSheet('Categories');
  const categories = [
    [Utilities.getUuid(), 'Electronics', 'electronics', 'Latest gadgets and electronics', 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=600', 1],
    [Utilities.getUuid(), 'Clothing', 'clothing', 'Fashion and apparel', 'https://images.pexels.com/photos/994234/pexels-photo-994234.jpeg?auto=compress&cs=tinysrgb&w=600', 2],
    [Utilities.getUuid(), 'Home & Kitchen', 'home-kitchen', 'Home essentials', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600', 3],
    [Utilities.getUuid(), 'Beauty & Care', 'beauty', 'Beauty and personal care', 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=600', 4],
    [Utilities.getUuid(), 'Sports', 'sports', 'Sports and fitness', 'https://images.pexels.com/photos/262524/pexels-photo-262524.jpeg?auto=compress&cs=tinysrgb&w=600', 5],
  ];
  categories.forEach(row => catSheet.appendRow(row));

  // Products
  const prodSheet = getSheet('Products');
  const now = new Date().toISOString();
  const products = [
    [Utilities.getUuid(),'ELEC-001','Wireless Bluetooth Headphones','wireless-bluetooth-headphones','Premium noise-cancelling wireless headphones with 30-hour battery life.',1499,2999,50,'https://images.pexels.com/photos/339465/pexels-photo-339465.jpeg?auto=compress&cs=tinysrgb&w=600','electronics','TRUE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
    [Utilities.getUuid(),'ELEC-002','Smart Watch Pro','smart-watch-pro','Advanced smartwatch with health monitoring and GPS.',2499,4999,30,'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600','electronics','TRUE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
    [Utilities.getUuid(),'CLO-001','Premium Cotton T-Shirt','premium-cotton-tshirt','Ultra-soft 100% organic cotton t-shirt.',599,999,200,'https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&w=600','clothing','TRUE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
    [Utilities.getUuid(),'CLO-002','Classic Denim Jeans','classic-denim-jeans','Straight-fit denim jeans with premium stretch fabric.',1299,2499,100,'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=600','clothing','FALSE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
    [Utilities.getUuid(),'HOME-001','Ceramic Coffee Mug Set','ceramic-coffee-mug-set','Set of 4 handcrafted ceramic mugs, 300ml each.',799,1499,75,'https://images.pexels.com/photos/606540/pexels-photo-606540.jpeg?auto=compress&cs=tinysrgb&w=600','home-kitchen','TRUE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
    [Utilities.getUuid(),'BEAUTY-001','Natural Face Serum','natural-face-serum','Vitamin C enriched face serum with hyaluronic acid.',499,999,150,'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=600','beauty','FALSE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
    [Utilities.getUuid(),'SPORT-001','Yoga Mat Premium','yoga-mat-premium','Extra thick 6mm non-slip yoga mat.',899,1799,60,'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600','sports','FALSE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
    [Utilities.getUuid(),'ELEC-003','Portable Bluetooth Speaker','portable-bluetooth-speaker','Waterproof portable speaker with 360-degree sound.',999,1999,80,'https://images.pexels.com/photos/1279365/pexels-photo-1279365.jpeg?auto=compress&cs=tinysrgb&w=600','electronics','TRUE','active','Free delivery within 5-7 business days','7-day easy returns',now,now],
  ];
  products.forEach(row => prodSheet.appendRow(row));

  // Admin (auto-created by getSheet)
  getSheet('Admin');

  // Settings - default site configuration
  const settingsSheet = getSheet('Settings');
  const settings = [
    ['storeName', 'ShopCraft'],
    ['storeTagline', 'Your destination for quality products. Cash on Delivery available.'],
    ['heroImage', 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    ['heroTitle', 'Quality Products at Best Prices'],
    ['heroSubtitle', 'Shop with confidence. Free delivery and easy returns available across India.'],
    ['heroBadge', 'Cash on Delivery Available'],
    ['collectionBannerImage', 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    ['collectionBannerTitle', 'New Collection'],
    ['collectionBannerSubtitle', 'Discover our latest arrivals with premium quality and exclusive deals.'],
    ['collectionBannerCta', 'Explore'],
    ['shippingInfo', 'Free delivery within 5-7 business days'],
    ['returnPolicy', '7-day easy returns'],
    ['supportEmail', 'althukuriya83@gmail.com'],
    ['supportPhone', '+91 98765 43210'],
    ['whatsappNumber', '919876543210'],
    ['ownerEmail', 'althukuriya83@gmail.com'],
    ['announcements', ''],
    ['footerText', 'All rights reserved.'],
  ];
  settings.forEach(row => settingsSheet.appendRow(row));

  SpreadsheetApp.flush();
  return 'Sample data + settings created successfully!';
}
