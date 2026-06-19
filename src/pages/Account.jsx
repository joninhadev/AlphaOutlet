import { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { customer, logout } = useCustomer();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!customer) {
      navigate('/login');
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/${customer.id}/orders`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
      })
      .catch(console.error);
  }, [customer, navigate]);

  if (!customer) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Olá, {customer.name}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{customer.email}</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary">
          Sair da Conta
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Endereço Padrão</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>{customer.address}</p>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Meus Pedidos</h2>
      {!orders || orders.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Você ainda não fez nenhum pedido.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Pedido #{order.id} - {new Date(order.created_at).toLocaleDateString('pt-BR')}</h4>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  {order.items.length} itens | Total: R$ {order.total.toFixed(2)}
                </p>
              </div>
              <div style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                backgroundColor: order.status === 'Entregue' ? '#2e7d32' : order.status === 'Enviado' ? '#0277bd' : 'var(--color-surface)',
                color: '#fff',
                fontWeight: 'bold'
              }}>
                {order.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
