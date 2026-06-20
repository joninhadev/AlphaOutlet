const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');

// Config Multer para salvar em memória (Base64) e evitar que a Render apague os arquivos ao reiniciar
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = 3001;

// Rotas de Produtos
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM products");
    const products = rows.map(r => ({
      ...r,
      price: parseFloat(r.price),
      colors: typeof r.colors === 'string' ? JSON.parse(r.colors) : r.colors,
      sizes: typeof r.sizes === 'string' ? JSON.parse(r.sizes) : r.sizes
    }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    const row = rows[0];
    res.json({
      ...row,
      price: parseFloat(row.price),
      colors: typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, description, colors, sizes } = req.body;
    
    // Converter arquivo da memória para Base64
    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      const b64 = req.file.buffer.toString('base64');
      const mime = req.file.mimetype;
      imageUrl = `data:${mime};base64,${b64}`;
    }
    
    const parsedColors = colors ? JSON.stringify(colors.split(',').map(c => {
      const trimmed = c.trim();
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    })) : '[]';
    
    const parsedSizes = sizes ? JSON.stringify(sizes.split(',').map(s => s.trim().toUpperCase())) : '[]';

    const [result] = await pool.execute(
      "INSERT INTO products (name, price, category, image, description, colors, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, parseFloat(price), category, imageUrl, description, parsedColors, parsedSizes]
    );
    res.json({ id: result.insertId, message: "Produto criado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Produto deletado com sucesso", affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas de Pedidos (Vendas)
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM orders ORDER BY created_at DESC");
    const orders = rows.map(r => ({
      ...r,
      total: parseFloat(r.total),
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items
    }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, customer_name, customer_email, customer_address, payment_method, items, total } = req.body;
    const [result] = await pool.execute(
      "INSERT INTO orders (customer_id, customer_name, customer_email, customer_address, payment_method, items, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [customer_id || null, customer_name, customer_email, customer_address, payment_method, JSON.stringify(items), total, 'Pendente']
    );
    res.json({ id: result.insertId, message: "Pedido criado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await pool.execute("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Status atualizado", affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rotas de Clientes (Auth & Perfil)
app.post('/api/customers/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    
    // Se for o primeiro usuário da loja, ele vira admin automaticamente pelo DB (ver db.js), mas por segurança:
    const [countRows] = await pool.execute("SELECT COUNT(*) as count FROM customers");
    const isFirstUser = countRows[0].count === 0;

    const [result] = await pool.execute(
      "INSERT INTO customers (name, email, password, address, is_admin) VALUES (?, ?, ?, ?, ?)",
      [name, email, password, address || '', isFirstUser ? true : false]
    );
    res.json({ success: true, customer: { id: result.insertId, name, email, address, is_admin: isFirstUser } });
  } catch (err) {
    if (err.message.includes('Duplicate entry') || err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: "Email já cadastrado" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/customers/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.execute("SELECT id, name, email, address, is_admin FROM customers WHERE email = ? AND password = ?", [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
    }
    const customer = rows[0];
    // Garantir que is_admin seja booleano
    customer.is_admin = !!customer.is_admin;
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/customers/:id/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC", [req.params.id]);
    const orders = rows.map(r => ({ 
      ...r, 
      total: parseFloat(r.total),
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items 
    }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Mock simples
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'alphaadmin123') {
    res.json({ success: true, token: 'fake-jwt-token-alpha' });
  } else {
    res.status(401).json({ success: false, message: 'Senha incorreta' });
  }
});

// Rota de Health Check (Monitoramento)
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
