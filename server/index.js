const express = require('express');
const cors = require('cors');
const db = require('./db');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Config Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });
app.use(express.json());

const PORT = 3001;

// Rotas de Produtos
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Parse arrays
    const products = rows.map(r => ({
      ...r,
      colors: JSON.parse(r.colors),
      sizes: JSON.parse(r.sizes)
    }));
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }
    res.json({
      ...row,
      colors: JSON.parse(row.colors),
      sizes: JSON.parse(row.sizes)
    });
  });
});

app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, category, description, colors, sizes } = req.body;
  
  // Se houver arquivo, usa a URL do arquivo. Se não, tenta usar a string passada no form (ou vazio)
  const imageUrl = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : (req.body.imageUrl || '');
  
  const parsedColors = colors ? JSON.stringify(colors.split(',').map(c => c.trim())) : '[]';
  const parsedSizes = sizes ? JSON.stringify(sizes.split(',').map(s => s.trim())) : '[]';

  const stmt = db.prepare("INSERT INTO products (name, price, category, image, description, colors, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)");
  stmt.run(name, parseFloat(price), category, imageUrl, description, parsedColors, parsedSizes, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: "Produto criado com sucesso" });
  });
  stmt.finalize();
});

app.delete('/api/products/:id', (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Produto deletado com sucesso", changes: this.changes });
  });
});

// Rotas de Pedidos (Vendas)
app.get('/api/orders', (req, res) => {
  db.all("SELECT * FROM orders ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const orders = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items)
    }));
    res.json(orders);
  });
});

app.post('/api/orders', (req, res) => {
  const { customer_id, customer_name, customer_email, customer_address, payment_method, items, total } = req.body;
  
  const stmt = db.prepare("INSERT INTO orders (customer_id, customer_name, customer_email, customer_address, payment_method, items, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(customer_id || null, customer_name, customer_email, customer_address, payment_method, JSON.stringify(items), total, 'Pendente', function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: "Pedido criado com sucesso" });
  });
  stmt.finalize();
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Status atualizado", changes: this.changes });
  });
});

// Rotas de Clientes (Auth & Perfil)
app.post('/api/customers/register', (req, res) => {
  const { name, email, password, address } = req.body;
  db.run("INSERT INTO customers (name, email, password, address) VALUES (?, ?, ?, ?)", [name, email, password, address || ''], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ success: false, message: "Email já cadastrado" });
      }
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, customer: { id: this.lastID, name, email, address } });
  });
});

app.post('/api/customers/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT id, name, email, address FROM customers WHERE email = ? AND password = ?", [email, password], (err, row) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!row) return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
    res.json({ success: true, customer: row });
  });
});

app.get('/api/customers/:id/orders', (req, res) => {
  db.all("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
    res.json(orders);
  });
});

// Login Mock simples (hardcoded por enquanto)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'alphaadmin123') {
    res.json({ success: true, token: 'fake-jwt-token-alpha' });
  } else {
    res.status(401).json({ success: false, message: 'Senha incorreta' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
