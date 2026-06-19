import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Checkout() {
  const { cart, total, clearCart, removeFromCart } = useCart();
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [customerName, setCustomerName] = useState(customer ? customer.name : '');
  const [customerEmail, setCustomerEmail] = useState(customer ? customer.email : '');
  const [customerAddress, setCustomerAddress] = useState(customer ? customer.address : '');
  const [paymentMethod, setPaymentMethod] = useState('Pix');

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name);
      setCustomerEmail(customer.email);
      setCustomerAddress(customer.address);
    }
  }, [customer]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      customer_id: customer ? customer.id : null,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_address: customerAddress,
      payment_method: paymentMethod,
      items: cart,
      total: total
    };

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      setSuccess(true);
      clearCart();
    } catch (e) {
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container animate-fade-in" style={{ padding: '8rem 2rem', textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '3rem', marginBottom: '1rem' }}>Pedido Recebido!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Obrigado por comprar na Alpha Outlet. Seu pedido foi registrado com sucesso.
        </p>
        
        {paymentMethod === 'Pix' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Pagamento via Pix</h3>
            <p style={{ marginBottom: '1rem' }}>Escaneie o QR Code ou copie a chave abaixo para finalizar o pagamento no seu banco.</p>
            <div style={{ backgroundColor: '#fff', padding: '1rem', display: 'inline-block', borderRadius: '8px', marginBottom: '1rem' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020126360014br.gov.bcb.pix0114+55119999999995204000053039865405${total.toFixed(2)}5802BR5912Alpha Outlet6009Sao Paulo62070503***6304`} alt="QR Code Pix" />
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Chave PIX Celular:</p>
              <code style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-bg)', borderRadius: '4px', fontSize: '1.1rem' }}>(11) 99999-9999</code>
            </div>
          </div>
        )}

        {paymentMethod === 'Dinheiro' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Pagamento em Dinheiro</h3>
            <p>Seu pedido está sendo separado. Por favor, tenha o valor exato no momento da entrega/retirada para facilitar o troco.</p>
          </div>
        )}

        <Link to="/catalogo" className="btn-primary">Voltar às Compras</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <h2>Seu carrinho está vazio.</h2>
        <Link to="/catalogo" className="btn-primary" style={{ marginTop: '2rem' }}>Ver Produtos</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Finalizar Compra</h1>
      
      {!customer && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Já é cliente?</h4>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Faça login para comprar mais rápido e acompanhar seus pedidos.</p>
          </div>
          <button onClick={() => navigate('/login', { state: { fromCheckout: true } })} className="btn-secondary">
            Entrar / Criar Conta
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
        {/* Formulário */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Dados de Entrega e Pagamento</h3>
          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input required type="text" placeholder="Nome Completo" value={customerName} onChange={e => setCustomerName(e.target.value)} className="input-field" />
            <input required type="email" placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="input-field" />
            <input required type="text" placeholder="Endereço Completo de Entrega" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="input-field" />
            
            <h4 style={{ marginTop: '1rem' }}>Método de Pagamento</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: `1px solid ${paymentMethod === 'Pix' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', flex: 1, backgroundColor: 'var(--color-surface)' }}>
                <input type="radio" name="payment" value="Pix" checked={paymentMethod === 'Pix'} onChange={e => setPaymentMethod(e.target.value)} />
                PIX
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: `1px solid ${paymentMethod === 'Dinheiro' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', flex: 1, backgroundColor: 'var(--color-surface)' }}>
                <input type="radio" name="payment" value="Dinheiro" checked={paymentMethod === 'Dinheiro'} onChange={e => setPaymentMethod(e.target.value)} />
                Dinheiro
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '2rem', padding: '1.2rem', width: '100%' }} disabled={loading}>
              {loading ? 'Processando...' : `Confirmar Pedido (R$ ${total.toFixed(2).replace('.', ',')})`}
            </button>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Resumo do Pedido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={item.product.image} alt={item.product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <h5 style={{ margin: 0 }}>{item.product.name}</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Tam: {item.size} | Cor: {item.color} | Qtd: {item.quantity}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                  <button onClick={() => removeFromCart(index)} style={{ color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Remover Item">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '1.2rem', fontWeight: 700 }}>
            <span>Total:</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
      
      <style>{`
        .input-field {
          padding: 1rem;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: #fff;
          outline: none;
        }
        .input-field:focus {
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
