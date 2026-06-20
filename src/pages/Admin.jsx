import { useState, useEffect } from 'react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Tabs: 'catalog' | 'orders'
  const [activeTab, setActiveTab] = useState('orders');

  // Form State (Product)
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) setIsAuthenticated(true);
      else alert('Senha incorreta!');
    } catch (e) { alert('Erro ao conectar ao servidor.'); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('colors', colors);
    formData.append('sizes', sizes);
    if (imageFile) formData.append('image', imageFile);

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products`, { method: 'POST', body: formData });
      alert('Produto cadastrado!');
      setName(''); setPrice(''); setCategory(''); setImageFile(null); setDescription(''); setColors(''); setSizes('');
      fetchProducts();
    } catch (e) { alert('Erro ao salvar produto'); }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Excluir este produto?')) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (e) { alert('Erro ao deletar'); }
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (e) { alert('Erro ao atualizar status'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', maxWidth: '500px' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <h2>Acesso Restrito</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Área de administração Alpha Outlet</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="password" placeholder="Senha de Admin" value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: '#fff', borderRadius: '6px' }}
            />
            <button className="btn-primary" type="submit">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in responsive-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Painel de Administração</h1>
        
        <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'var(--color-surface)', padding: '0.5rem', borderRadius: '8px' }}>
          <button 
            onClick={() => setActiveTab('orders')} 
            style={{ padding: '0.5rem 1.5rem', borderRadius: '4px', backgroundColor: activeTab === 'orders' ? 'var(--color-primary)' : 'transparent', color: '#fff', fontWeight: 600, transition: 'var(--transition-fast)' }}>
            Gestão de Vendas
          </button>
          <button 
            onClick={() => setActiveTab('catalog')} 
            style={{ padding: '0.5rem 1.5rem', borderRadius: '4px', backgroundColor: activeTab === 'catalog' ? 'var(--color-primary)' : 'transparent', color: '#fff', fontWeight: 600, transition: 'var(--transition-fast)' }}>
            Catálogo de Produtos
          </button>
        </div>
      </div>
      
      {activeTab === 'catalog' && (
        <div className="grid-responsive grid-responsive-admin">
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', alignSelf: 'start' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Adicionar Novo Produto</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} className="admin-input" />
              <input required type="number" step="0.01" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} className="admin-input" />
              <input required type="text" placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} className="admin-input" />
              <label style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Imagem do Produto:</label>
              <input required type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="admin-input" style={{ padding: '0.5rem' }} />
              <textarea required placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="admin-input" rows="3" />
              <input required type="text" placeholder="Cores (vírgula)" value={colors} onChange={e => setColors(e.target.value)} className="admin-input" />
              <input required type="text" placeholder="Tamanhos (vírgula)" value={sizes} onChange={e => setSizes(e.target.value)} className="admin-input" />
              <button type="submit" className="btn-primary">Salvar Produto</button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>Catálogo Atual</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {products.map(p => (
                <div key={p.id} className="glass-panel" style={{ padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={p.image} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div>
                      <h5 style={{ margin: 0 }}>{p.name}</h5>
                      <p style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 'bold' }}>R$ {p.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)', padding: '0.5rem 1rem', borderRadius: '4px' }}>Excluir</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Pedidos Recentes</h3>
          {orders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>Nenhum pedido recebido ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map(order => (
                <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Pedido #{order.id}</h4>
                      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        style={{ 
                          padding: '0.5rem', 
                          borderRadius: '4px', 
                          backgroundColor: order.status === 'Entregue' ? '#2e7d32' : order.status === 'Enviado' ? '#0277bd' : 'var(--color-surface)',
                          color: '#fff',
                          border: '1px solid var(--color-border)',
                          outline: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregue">Entregue</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-responsive grid-responsive-2">
                    <div>
                      <h5 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Cliente</h5>
                      <p style={{ margin: 0 }}><strong>{order.customer_name}</strong></p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{order.customer_email}</p>
                      {order.customer_address === 'Retirada na Loja' ? (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#ffb300', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          📍 Retirada na Loja
                        </p>
                      ) : (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>🚚 {order.customer_address}</p>
                      )}
                      
                      <h5 style={{ color: 'var(--color-primary)', margin: '1rem 0 0.5rem 0' }}>Pagamento</h5>
                      <p style={{ margin: 0, fontWeight: 600 }}>{order.payment_method}</p>
                    </div>

                    <div>
                      <h5 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Itens</h5>
                      <div style={{ backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: '4px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: idx !== order.items.length - 1 ? '0.5rem' : 0 }}>
                            <span style={{ fontSize: '0.9rem' }}>{item.quantity}x {item.product.name} ({item.color}, {item.size})</span>
                            <span style={{ fontSize: '0.9rem' }}>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>TOTAL</span>
                          <span style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>R$ {order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-input {
          padding: 0.8rem;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          color: #fff;
          outline: none;
        }
      `}</style>
    </div>
  );
}
