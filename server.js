const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");

const app  = express();
app.use(cors());
app.use(express.json());

// ── DB Connection ─────────────────────────────────────────────
const db = mysql.createConnection({
  host:     "localhost",
  user:     "root",       // change to your MySQL username
  password: "12345678",           // change to your MySQL password
  database: "ecommerce_db"
});

db.connect((err) => {
  if (err) { console.error("DB connection failed:", err); return; }
  console.log("Connected to MySQL database.");
});

// ── Helper ────────────────────────────────────────────────────
const query = (sql, params = []) =>
  new Promise((res, rej) =>
    db.query(sql, params, (err, rows) => (err ? rej(err) : res(rows)))
  );

// ════════════════════════════════════════════════════════════
//  CUSTOMERS
// ════════════════════════════════════════════════════════════
app.get("/api/customers", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM Customers ORDER BY customer_id DESC");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/customers", async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await query(
      "INSERT INTO Customers (name, email) VALUES (?, ?)", [name, email]
    );
    res.json({ customer_id: result.insertId, name, email });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/customers/:id", async (req, res) => {
  const { name, email } = req.body;
  try {
    await query(
      "UPDATE Customers SET name=?, email=? WHERE customer_id=?",
      [name, email, req.params.id]
    );
    res.json({ message: "Customer updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    await query("DELETE FROM Customers WHERE customer_id=?", [req.params.id]);
    res.json({ message: "Customer deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//  CATEGORIES
// ════════════════════════════════════════════════════════════
app.get("/api/categories", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM Categories ORDER BY category_id DESC");
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/categories", async (req, res) => {
  const { category_name } = req.body;
  try {
    const result = await query(
      "INSERT INTO Categories (category_name) VALUES (?)", [category_name]
    );
    res.json({ category_id: result.insertId, category_name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/categories/:id", async (req, res) => {
  const { category_name } = req.body;
  try {
    await query(
      "UPDATE Categories SET category_name=? WHERE category_id=?",
      [category_name, req.params.id]
    );
    res.json({ message: "Category updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await query("DELETE FROM Categories WHERE category_id=?", [req.params.id]);
    res.json({ message: "Category deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════
app.get("/api/products", async (req, res) => {
  try {
    const rows = await query(`
      SELECT p.*, c.category_name
      FROM Products p
      JOIN Categories c ON p.category_id = c.category_id
      ORDER BY p.product_id DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/products", async (req, res) => {
  const { name, price, category_id } = req.body;
  try {
    const result = await query(
      "INSERT INTO Products (name, price, category_id) VALUES (?, ?, ?)",
      [name, price, category_id]
    );
    res.json({ product_id: result.insertId, name, price, category_id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/products/:id", async (req, res) => {
  const { name, price, category_id } = req.body;
  try {
    await query(
      "UPDATE Products SET name=?, price=?, category_id=? WHERE product_id=?",
      [name, price, category_id, req.params.id]
    );
    res.json({ message: "Product updated" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await query("DELETE FROM Products WHERE product_id=?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════
app.get("/api/orders", async (req, res) => {
  try {
    const rows = await query(`
      SELECT o.*, c.name AS customer_name
      FROM Orders o
      JOIN Customers c ON o.customer_id = c.customer_id
      ORDER BY o.order_id DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/orders", async (req, res) => {
  const { customer_id, order_date } = req.body;
  try {
    const result = await query(
      "INSERT INTO Orders (customer_id, order_date) VALUES (?, ?)",
      [customer_id, order_date]
    );
    res.json({ order_id: result.insertId, customer_id, order_date });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const allowed = ['Placed','Confirmed','Shipped','Out for Delivery','Delivered'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be one of: " + allowed.join(', ') });
  }
  try {
    await query("UPDATE Orders SET delivery_status=? WHERE order_id=?", [status, req.params.id]);
    res.json({ message: "Status updated", order_id: req.params.id, delivery_status: status });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    await query("DELETE FROM Order_Items WHERE order_id=?", [req.params.id]);
    await query("DELETE FROM Orders WHERE order_id=?",      [req.params.id]);
    res.json({ message: "Order deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//  ORDER ITEMS
// ════════════════════════════════════════════════════════════
app.get("/api/order-items/:order_id", async (req, res) => {
  try {
    const rows = await query(`
      SELECT oi.*, p.name AS product_name, p.price
      FROM Order_Items oi
      JOIN Products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `, [req.params.order_id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/order-items", async (req, res) => {
  const { order_id, product_id, quantity } = req.body;
  try {
    const result = await query(
      "INSERT INTO Order_Items (order_id, product_id, quantity) VALUES (?, ?, ?)",
      [order_id, product_id, quantity]
    );
    res.json({ item_id: result.insertId, order_id, product_id, quantity });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/order-items/:id", async (req, res) => {
  try {
    await query("DELETE FROM Order_Items WHERE item_id=?", [req.params.id]);
    res.json({ message: "Item deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//  CART
// ════════════════════════════════════════════════════════════
app.get("/api/cart/:customer_id", async (req, res) => {
  try {
    const rows = await query(`
      SELECT c.*, p.name AS product_name, p.price, cat.category_name
      FROM Cart c
      JOIN Products p ON c.product_id = p.product_id
      JOIN Categories cat ON p.category_id = cat.category_id
      WHERE c.customer_id = ?
      ORDER BY c.added_at DESC
    `, [req.params.customer_id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/cart", async (req, res) => {
  const { customer_id, product_id, quantity } = req.body;
  try {
    // Check if item already in cart — if so, update quantity
    const existing = await query(
      "SELECT * FROM Cart WHERE customer_id=? AND product_id=?",
      [customer_id, product_id]
    );
    if (existing.length > 0) {
      await query(
        "UPDATE Cart SET quantity = quantity + ? WHERE cart_id=?",
        [quantity || 1, existing[0].cart_id]
      );
      res.json({ message: "Cart updated", cart_id: existing[0].cart_id });
    } else {
      const result = await query(
        "INSERT INTO Cart (customer_id, product_id, quantity) VALUES (?, ?, ?)",
        [customer_id, product_id, quantity || 1]
      );
      res.json({ cart_id: result.insertId, customer_id, product_id, quantity: quantity || 1 });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/cart/:cart_id", async (req, res) => {
  const { quantity } = req.body;
  try {
    if (quantity <= 0) {
      await query("DELETE FROM Cart WHERE cart_id=?", [req.params.cart_id]);
      res.json({ message: "Item removed from cart" });
    } else {
      await query("UPDATE Cart SET quantity=? WHERE cart_id=?", [quantity, req.params.cart_id]);
      res.json({ message: "Cart updated" });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/cart/:cart_id", async (req, res) => {
  try {
    await query("DELETE FROM Cart WHERE cart_id=?", [req.params.cart_id]);
    res.json({ message: "Item removed from cart" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/cart/checkout/:customer_id", async (req, res) => {
  try {
    const cartItems = await query(
      "SELECT * FROM Cart WHERE customer_id=?", [req.params.customer_id]
    );
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    // Create new order
    const order = await query(
      "INSERT INTO Orders (customer_id, order_date, delivery_status) VALUES (?, CURDATE(), 'Placed')",
      [req.params.customer_id]
    );
    const orderId = order.insertId;
    // Add all cart items as order items
    for (const item of cartItems) {
      await query(
        "INSERT INTO Order_Items (order_id, product_id, quantity) VALUES (?, ?, ?)",
        [orderId, item.product_id, item.quantity]
      );
    }
    // Clear cart
    await query("DELETE FROM Cart WHERE customer_id=?", [req.params.customer_id]);
    res.json({ message: "Checkout successful", order_id: orderId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//  PURCHASE HISTORY
// ════════════════════════════════════════════════════════════
app.get("/api/orders/history/:customer_id", async (req, res) => {
  try {
    const orders = await query(`
      SELECT o.*, c.name AS customer_name
      FROM Orders o
      JOIN Customers c ON o.customer_id = c.customer_id
      WHERE o.customer_id = ?
      ORDER BY o.order_date DESC
    `, [req.params.customer_id]);

    // Fetch items for each order
    for (const order of orders) {
      const items = await query(`
        SELECT oi.*, p.name AS product_name, p.price
        FROM Order_Items oi
        JOIN Products p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
      `, [order.order_id]);
      order.items = items;
      order.total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    }
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ════════════════════════════════════════════════════════════
app.get("/api/stats", async (req, res) => {
  try {
    const [[{ customers }]] = [await query("SELECT COUNT(*) AS customers FROM Customers")];
    const [[{ products  }]] = [await query("SELECT COUNT(*) AS products  FROM Products")];
    const [[{ orders    }]] = [await query("SELECT COUNT(*) AS orders    FROM Orders")];
    const [[{ revenue   }]] = [await query(`
      SELECT COALESCE(SUM(p.price * oi.quantity), 0) AS revenue
      FROM Order_Items oi JOIN Products p ON oi.product_id = p.product_id
    `)];
    const [[{ cartItems }]] = [await query("SELECT COUNT(*) AS cartItems FROM Cart")];
    res.json({ customers, products, orders, revenue, cartItems });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Start ─────────────────────────────────────────────────────
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
