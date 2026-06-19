import { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Login() {
  const { login } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Decide where to send the user after login
  const fromCheckout = location.state?.fromCheckout || false;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/login` : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/customers/register`;
    
    const bodyData = isLogin 
      ? { email, password } 
      : { name, email, password, address };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      
      if (data.success) {
        login(data.customer);
        navigate(fromCheckout ? '/checkout' : '/conta');
      } else {
        alert(data.message || 'Erro ao processar.');
      }
    } catch (err) {
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '8rem 2rem', maxWidth: '500px' }}>
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          {isLogin ? 'Fazer Login' : 'Criar Conta'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          {isLogin ? 'Acesse sua conta para comprar mais rápido.' : 'Crie sua conta para gerenciar seus pedidos.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input required type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="input-field" />
          )}
          
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
          <input required type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="input-field" />
          
          {!isLogin && (
            <input required type="text" placeholder="Endereço Completo de Entrega" value={address} onChange={e => setAddress(e.target.value)} className="input-field" />
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            {isLogin ? 'Ainda não tem conta? Crie aqui.' : 'Já tem conta? Faça login.'}
          </button>
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
      `}</style>
    </div>
  );
}
