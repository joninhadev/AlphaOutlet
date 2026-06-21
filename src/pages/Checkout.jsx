import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Checkout() {
  const { cart, total, clearCart, removeFromCart } = useCart();
  const { customer, login } = useCustomer(); // login pra atualizar customer na tela
  const navigate = useNavigate();
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dados Básicos
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // Endereço (Objeto)
  const [addressObj, setAddressObj] = useState({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
  });
  
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(true);

  // Opções de Compra
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [deliveryMethod, setDeliveryMethod] = useState('Entrega');
  
  // Dados do PIX e Pedido
  const [pixData, setPixData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [pixPaid, setPixPaid] = useState(false);

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name);
      setCustomerEmail(customer.email);
      
      if (customer.address) {
        try {
          // Tenta parsear caso seja o novo formato JSON
          const parsed = JSON.parse(customer.address);
          if (parsed.rua) {
            setAddressObj(parsed);
            setHasSavedAddress(true);
            setIsEditingAddress(false);
            return;
          }
        } catch (e) {
          // É o formato antigo (texto livre)
          if (customer.address.trim().length > 0) {
            setAddressObj(prev => ({ ...prev, rua: customer.address }));
            setHasSavedAddress(true);
            setIsEditingAddress(false);
          }
        }
      }
    }
  }, [customer]);

  // Autocompletar CEP
  useEffect(() => {
    const fetchCep = async () => {
      const cleanCep = addressObj.cep.replace(/\\D/g, '');
      if (cleanCep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setAddressObj(prev => ({
              ...prev,
              rua: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            }));
          }
        } catch (e) {
          console.error("Erro ao buscar CEP", e);
        }
      }
    };
    fetchCep();
  }, [addressObj.cep]);

  // Polling para checar se o PIX foi pago
  useEffect(() => {
    let intervalId;
    if (pixData?.payment_id && orderId && !pixPaid) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/pix/${pixData.payment_id}/status?orderId=${orderId}`);
          const data = await res.json();
          if (data.success && data.status === 'approved') {
            setPixPaid(true);
            clearInterval(intervalId);
          }
        } catch (e) { console.error('Erro no polling do pix', e); }
      }, 3000); // Verifica a cada 3 segundos
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [pixData, orderId, pixPaid]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fullAddressString = JSON.stringify(addressObj);
    const displayAddress = deliveryMethod === 'Retirada' 
      ? 'Retirada na Loja' 
      : `${addressObj.rua}, ${addressObj.numero} ${addressObj.complemento ? '('+addressObj.complemento+')' : ''} - ${addressObj.bairro}, ${addressObj.cidade}/${addressObj.estado} - CEP: ${addressObj.cep}`;

    // Atualiza endereço do cliente logado se ele estiver editando
    if (customer && isEditingAddress && deliveryMethod === 'Entrega') {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/${customer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: fullAddressString })
        });
        login({ ...customer, address: fullAddressString }); // Atualiza no Contexto
      } catch (err) { console.error('Falha ao atualizar perfil do cliente', err); }
    }

    const orderData = {
      customer_id: customer ? customer.id : null,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_address: displayAddress,
      payment_method: paymentMethod,
      items: cart,
      total: total
    };

    try {
      // 1. Criar o pedido
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const orderDataResponse = await orderRes.json();
      setOrderId(orderDataResponse.id);

      // 2. Se for PIX, gerar QR Code pelo Mercado Pago
      if (paymentMethod === 'Pix') {
        const pixRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/pix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_amount: total,
            description: `Compra na Alpha Outlet - Cliente: ${customerName}`,
            email: customerEmail,
            first_name: customerName.split(' ')[0]
          })
        });
        const pixResult = await pixRes.json();
        if (pixResult.success) {
          setPixData(pixResult);
        } else {
          alert('Aviso: Falha ao gerar o código PIX automático. Entre em contato conosco.');
        }
      }

      setSuccess(true);
      clearCart();
    } catch (e) {
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      alert('Código Copia e Cola copiado!');
    }
  };

  if (success) {
    if (pixPaid) {
      return (
        <div className="container animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', backgroundColor: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', animation: 'scaleIn 0.5s ease-out' }}>
            <svg style={{ width: '60px', height: '60px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 style={{ color: '#4CAF50', fontSize: '3rem', marginBottom: '1rem' }}>Pagamento Aprovado! 🎉</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '2rem' }}>
            Dinheiro na conta! Prepara o guarda-roupa, porque o seu pedido já está sendo separado!
          </p>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', marginBottom: '2rem', width: '100%' }}>
            <p style={{ margin: 0 }}>Enviaremos as atualizações de rastreio para o seu e-mail: <strong>{customerEmail}</strong></p>
          </div>
          <Link to="/catalogo" className="btn-primary">Continuar Comprando</Link>
          <style>{`
            @keyframes scaleIn {
              0% { transform: scale(0); opacity: 0; }
              60% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      );
    }

    return (
      <div className="container animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px' }}>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '3rem', marginBottom: '1rem' }}>Pedido Recebido!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Obrigado por comprar na Alpha Outlet.
        </p>

        {deliveryMethod === 'Retirada' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', marginBottom: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--color-primary)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>📍 Pedido para Retirada</h3>
            <p>Seu pedido está sendo separado. Avisaremos por e-mail assim que estiver pronto para ser retirado na nossa loja física.</p>
          </div>
        )}
        
        {paymentMethod === 'Pix' && pixData && (
          <div className="glass-panel" style={{ padding: '3rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', border: '1px solid var(--color-primary)' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Aguardando Pagamento...</h2>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Abra o app do seu banco e escaneie o QR Code abaixo:</p>
            
            <div style={{ backgroundColor: '#fff', padding: '1rem', display: 'inline-block', borderRadius: '12px', marginBottom: '2rem' }}>
              <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" style={{ width: '250px', height: '250px' }} />
            </div>
            
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Ou copie o código para a opção "Pix Copia e Cola":</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={pixData.qr_code} 
                  readOnly 
                  style={{ padding: '1rem', width: '70%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '6px', color: '#fff' }}
                />
                <button onClick={copyPixCode} className="btn-primary" style={{ padding: '1rem 2rem' }}>Copiar</button>
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span style={{ fontSize: '0.9rem' }}>Aguardando confirmação automática do banco... A tela atualizará sozinha.</span>
            </div>
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}

        {paymentMethod === 'Dinheiro' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Pagamento em Dinheiro</h3>
            <p>Por favor, tenha o valor exato no momento da entrega/retirada para facilitar o troco.</p>
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
    <div className="container animate-fade-in responsive-padding">
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

      <div className="grid-responsive grid-responsive-2">
        {/* Formulário */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Dados Pessoais</h3>
          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input required type="text" placeholder="Nome Completo" value={customerName} onChange={e => setCustomerName(e.target.value)} className="input-field" />
              <input required type="email" placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="input-field" />
            </div>
            
            <h4 style={{ marginTop: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Método de Entrega</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: `1px solid ${deliveryMethod === 'Entrega' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', flex: 1, backgroundColor: 'var(--color-surface)' }}>
                <input type="radio" name="delivery" value="Entrega" checked={deliveryMethod === 'Entrega'} onChange={e => setDeliveryMethod(e.target.value)} />
                Receber em Casa
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: `1px solid ${deliveryMethod === 'Retirada' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', flex: 1, backgroundColor: 'var(--color-surface)' }}>
                <input type="radio" name="delivery" value="Retirada" checked={deliveryMethod === 'Retirada'} onChange={e => setDeliveryMethod(e.target.value)} />
                Retirar na Loja
              </label>
            </div>

            {deliveryMethod === 'Entrega' && (
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Endereço de Entrega</h4>
                  {hasSavedAddress && !isEditingAddress && (
                    <button type="button" onClick={() => setIsEditingAddress(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                      Editar Endereço
                    </button>
                  )}
                </div>

                {!isEditingAddress ? (
                  <div style={{ color: 'var(--color-text-muted)' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{addressObj.rua}, {addressObj.numero} {addressObj.complemento && `(${addressObj.complemento})`}</p>
                    <p style={{ margin: '0' }}>{addressObj.bairro} - {addressObj.cidade}/{addressObj.estado}</p>
                    <p style={{ margin: '0' }}>CEP: {addressObj.cep}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <input required type="text" placeholder="CEP" value={addressObj.cep} onChange={e => setAddressObj({...addressObj, cep: e.target.value})} className="input-field" maxLength="9" />
                      <input required type="text" placeholder="Rua / Avenida" value={addressObj.rua} onChange={e => setAddressObj({...addressObj, rua: e.target.value})} className="input-field" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <input required type="text" placeholder="Número" value={addressObj.numero} onChange={e => setAddressObj({...addressObj, numero: e.target.value})} className="input-field" />
                      <input type="text" placeholder="Complemento (Opcional)" value={addressObj.complemento} onChange={e => setAddressObj({...addressObj, complemento: e.target.value})} className="input-field" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <input required type="text" placeholder="Bairro" value={addressObj.bairro} onChange={e => setAddressObj({...addressObj, bairro: e.target.value})} className="input-field" />
                      <input required type="text" placeholder="Cidade" value={addressObj.cidade} onChange={e => setAddressObj({...addressObj, cidade: e.target.value})} className="input-field" />
                      <input required type="text" placeholder="Estado (UF)" value={addressObj.estado} onChange={e => setAddressObj({...addressObj, estado: e.target.value})} className="input-field" maxLength="2" />
                    </div>
                    {hasSavedAddress && (
                      <button type="button" onClick={() => setIsEditingAddress(false)} style={{ background: 'none', border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '4px', color: '#fff', cursor: 'pointer', marginTop: '0.5rem' }}>
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {deliveryMethod === 'Retirada' && (
              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>📍 Retirada Presencial na Loja</h4>
                <p style={{ margin: 0 }}>Você não pagará frete. O endereço completo da loja será exibido no comprovante do pedido após o pagamento.</p>
              </div>
            )}
            
            <h4 style={{ marginTop: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Método de Pagamento</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: `1px solid ${paymentMethod === 'Pix' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', flex: 1, backgroundColor: 'var(--color-surface)' }}>
                <input type="radio" name="payment" value="Pix" checked={paymentMethod === 'Pix'} onChange={e => setPaymentMethod(e.target.value)} />
                PIX Automático (Recomendado)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: `1px solid ${paymentMethod === 'Dinheiro' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: '6px', flex: 1, backgroundColor: 'var(--color-surface)' }}>
                <input type="radio" name="payment" value="Dinheiro" checked={paymentMethod === 'Dinheiro'} onChange={e => setPaymentMethod(e.target.value)} />
                Pagar na Entrega/Retirada
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '2rem', padding: '1.2rem', width: '100%', fontSize: '1.1rem', fontWeight: 'bold' }} disabled={loading}>
              {loading ? 'Processando e Gerando PIX...' : `Confirmar e Pagar R$ ${total.toFixed(2).replace('.', ',')}`}
            </button>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '8px', alignSelf: 'start', position: 'sticky', top: '100px' }}>
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
                  <button onClick={() => removeFromCart(index)} style={{ color: 'var(--color-error)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.5rem' }} title="Remover Item">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            <span>Total a Pagar:</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
      
      <style>{`
        .input-field {
          padding: 1rem;
          background-color: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: #fff;
          outline: none;
          width: 100%;
        }
        .input-field:focus {
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}
