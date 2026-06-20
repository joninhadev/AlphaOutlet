const mysql = require('mysql2/promise');

// O usuário pode ter configurado o banco de dados como "sys" no TiDB, que é read-only.
// Precisamos criar o banco alpha_outlet no "sys" (usando uma conexão temporária),
// e então criar o pool principal apontando diretamente para o "alpha_outlet".
const dbUrl = process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/sys';
const appDbUrl = dbUrl.replace('/sys', '/alpha_outlet');

// Pool temporário apenas para criar o banco de dados
const initPool = mysql.createPool({ uri: dbUrl });

// Pool oficial da aplicação
const pool = mysql.createPool({
  uri: appDbUrl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 20000
});

async function initializeDB() {
  try {
    // 1. Criar o banco se não existir usando a url original
    const initConn = await initPool.getConnection();
    await initConn.query('CREATE DATABASE IF NOT EXISTS alpha_outlet');
    initConn.release();

    // 2. Agora o pool oficial pode conectar
    const connection = await pool.getConnection();
    
    // Tabela de Produtos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        image TEXT,
        description TEXT,
        colors JSON,
        sizes JSON
      )
    `);

    // Tabela de Pedidos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        items JSON NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de Clientes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Atualização: Garantir que a coluna exista caso a tabela já estivesse criada
    try {
      await connection.execute("ALTER TABLE customers ADD COLUMN is_admin BOOLEAN DEFAULT FALSE");
    } catch (e) {
      // Ignora se a coluna já existir (ER_DUP_FIELDNAME)
    }
    
    // Transforma o primeiro usuário e os e-mails oficiais em admin automaticamente
    await connection.execute("UPDATE customers SET is_admin = TRUE WHERE id = 1 OR email IN ('joninhac10@gmail.com', 'erica16052006@gmail.com')");

    // Inserir dados iniciais se a tabela de produtos estiver vazia
    const [rows] = await connection.execute("SELECT COUNT(*) AS count FROM products");
    if (rows[0].count === 0) {
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

      for (const p of initialProducts) {
        await connection.execute(
          "INSERT INTO products (name, price, category, image, description, colors, sizes) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [p.name, p.price, p.category, p.image, p.description, p.colors, p.sizes]
        );
      }
      console.log("Banco de dados MySQL populado com sucesso.");
    }
    
    connection.release();
    console.log("Conectado ao MySQL com sucesso e banco alpha_outlet preparado!");
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}

initializeDB();

module.exports = pool;
