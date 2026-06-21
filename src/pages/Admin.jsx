import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';

export default function Admin() {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Redireciona caso não seja admin
  useEffect(() => {
    if (customer !== undefined && (!customer || !customer.is_admin)) {
      navigate('/login');
    }
  }, [customer, navigate]);

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
    if (customer?.is_admin) {
      fetchProducts();
      fetchOrders();
    }
  }, [customer]);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Proteção extra
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('colors', colors);
    formData.append('sizes', sizes);
    if (imageFile) formData.append('image', imageFile);

    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products${editingProductId ? '/' + editingProductId : ''}`;
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, { method: method, body: formData });
      
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errData = await res.json();
          throw new Error(errData.error || errData.message || 'Erro do servidor');
        } else {
          const errText = await res.text();
          throw new Error(`Erro ${res.status}: Servidor indisponível ou configurado incorretamente. Veja a aba Network.`);
        }
      }
      alert(editingProductId ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      
      // Limpar form
      setName(''); setPrice(''); setCategory(''); setImageFile(null); setDescription(''); setColors(''); setSizes('');
      setEditingProductId(null);
      fetchProducts();
    } catch (e) { 
      console.error(e);
      alert('Erro ao salvar produto: ' + e.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setDescription(product.description);
    setColors(Array.isArray(product.colors) ? product.colors.join(', ') : '');
    setSizes(Array.isArray(product.sizes) ? product.sizes.join(', ') : '');
    setEditingProductId(product.id);
    setImageFile(null); // Limpar arquivo caso haja algum
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setName(''); setPrice(''); setCategory(''); setImageFile(null); setDescription(''); setColors(''); setSizes('');
    setEditingProductId(null);
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

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders/${id}`, { method: 'DELETE' });
        fetchOrders();
      } catch (e) { alert('Erro ao excluir pedido'); }
    }
  };

  const handleDeleteAllOrders = async () => {
    if (window.confirm('Excluir TODOS os pedidos? Esta ação não pode ser desfeita.')) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders`, { method: 'DELETE' });
        fetchOrders();
      } catch (e) { alert('Erro ao excluir pedidos'); }
    }
  };

  if (!customer || !customer.is_admin) {
    return (
      <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p>Verificando credenciais...</p>
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
            <h3 style={{ marginBottom: '1.5rem' }}>{editingProductId ? 'Atualizar Produto' : 'Adicionar Novo Produto'}</h3>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} className="admin-input" />
              <input required type="number" step="0.01" placeholder="Preço (Ex: 99.90)" value={price} onChange={e => setPrice(e.target.value)} className="admin-input" />
              <input required type="text" placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} className="admin-input" />
              <textarea required placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="admin-input" rows="3" />
              <input required type="text" placeholder="Cores (vírgula)" value={colors} onChange={e => setColors(e.target.value)} className="admin-input" />
              <input required type="text" placeholder="Tamanhos (vírgula)" value={sizes} onChange={e => setSizes(e.target.value)} className="admin-input" />
              <input type={editingProductId ? "file" : "file"} required={!editingProductId} accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="admin-input" />
              {editingProductId && <small style={{color:'var(--color-text-muted)'}}>Deixe em branco para manter a imagem atual.</small>}
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" type="submit" disabled={isSubmitting} style={{ flex: 1 }}>
                  {isSubmitting ? 'Salvando...' : editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
                {editingProductId && (
                  <button type="button" onClick={cancelEdit} style={{ padding: '0.8rem', backgroundColor: 'var(--color-surface)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                )}
              </div>
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
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleEditProduct(p)} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 50, 50, 0.2)', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '4px', cursor: 'pointer' }}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Pedidos Recentes</h3>
            {orders.length > 0 && (
              <button onClick={handleDeleteAllOrders} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 50, 50, 0.15)', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                Excluir Todos
              </button>
            )}
          </div>
          {orders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>Nenhum pedido recebido ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map(order => (
                <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Pedido #{order.id}</h4>
                      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {new Date(order.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        style={{ 
                          padding: '0.5rem', 
                          borderRadius: '4px', 
                          backgroundColor: order.status === 'Entregue' ? '#2e7d32' : order.status === 'Enviado' ? '#0277bd' : order.status === 'Aprovado' ? '#1b5e20' : 'var(--color-surface)',
                          color: '#fff',
                          border: '1px solid var(--color-border)',
                          outline: 'none',
                          fontWeight: 600,
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Aprovado">Aprovado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregue">Entregue</option>
                      </select>
                      <button onClick={() => handleDeleteOrder(order.id)} style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255, 50, 50, 0.15)', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="grid-responsive grid-responsive-2">
                    <div>
                      <h5 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</h5>
                      <p style={{ margin: 0 }}><strong>{order.customer_name}</strong></p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{order.customer_email}</p>
                      {order.customer_address === 'Retirada na Loja' ? (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#ffb300', fontWeight: 600 }}>
                          Retirada na Loja
                        </p>
                      ) : (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>{order.customer_address}</p>
                      )}
                      
                      <h5 style={{ color: 'var(--color-primary)', margin: '1rem 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pagamento</h5>
                      <p style={{ margin: 0, fontWeight: 600 }}>{order.payment_method}</p>
                    </div>

                    <div>
                      <h5 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Itens</h5>
                      <div style={{ backgroundColor: 'var(--color-bg)', padding: '1rem', borderRadius: '4px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: idx !== order.items.length - 1 ? '0.5rem' : 0 }}>
                            <span style={{ fontSize: '0.85rem' }}>{item.quantity}x {item.product.name} ({item.color}, {item.size})</span>
                            <span style={{ fontSize: '0.85rem' }}>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>TOTAL</span>
                          <span style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>R$ {order.total.toFixed(2)}</span>
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
