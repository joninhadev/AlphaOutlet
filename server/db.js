const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Tabela de Produtos
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    image TEXT,
    description TEXT,
    colors TEXT,
    sizes TEXT
  )`);

  // Tabela de Pedidos
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de Clientes
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Inserir dados iniciais se a tabela estiver vazia
  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (name, price, category, image, description, colors, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)");
      
      const initialProducts = [
        {
          name: "Jaqueta de Couro Rústica",
          price: 349.90,
          category: "Agasalhos",
          image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Jaqueta de couro legítimo com acabamento estonado e corte slim.",
          colors: JSON.stringify(["Preto", "Marrom"]),
          sizes: JSON.stringify(["P", "M", "G", "GG"])
        },
        {
          name: "Camiseta Longline Alpha",
          price: 89.90,
          category: "Camisetas",
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Camiseta premium em algodão egípcio, corte alongado.",
          colors: JSON.stringify(["Branco", "Preto", "Cinza Chumbo"]),
          sizes: JSON.stringify(["M", "G", "GG"])
        },
        {
          name: "Bota Chelsea Suede",
          price: 289.90,
          category: "Calçados",
          image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          description: "Bota estilo chelsea com acabamento em camurça rústica.",
          colors: JSON.stringify(["Marrom Escuro", "Caramelo"]),
          sizes: JSON.stringify(["39", "40", "41", "42"])
        }
      ];

      initialProducts.forEach(p => {
        stmt.run(p.name, p.price, p.category, p.image, p.description, p.colors, p.sizes);
      });
      stmt.finalize();
      console.log("Banco de dados populado com sucesso.");
    }
  });
});

module.exports = db;
