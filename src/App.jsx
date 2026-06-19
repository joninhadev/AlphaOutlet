import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

// Paginas Placeholder
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Account from './pages/Account';
import { CartProvider, useCart } from './context/CartContext';
import { CustomerProvider, useCustomer } from './context/CustomerContext';
import { User } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();
  const { customer } = useCustomer();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="glass-panel" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2px' }}>
          ALPHA<span style={{ color: 'var(--color-primary)' }}>OUTLET</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <ul style={{ display: 'flex', listStyle: 'none', gap: '2rem' }}>
            <li><Link to="/">Início</Link></li>
            <li><Link to="/catalogo">Catálogo</Link></li>
            <li><Link to="/contato">Contato</Link></li>
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to={customer ? "/conta" : "/login"} style={{ color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={24} />
            <span style={{ fontSize: '0.9rem', display: 'none' }} className="desktop-nav">
              {customer ? `Olá, ${customer?.name?.split(' ')[0] || 'Cliente'}` : 'Entrar'}
            </span>
          </Link>
          <Link to="/checkout" style={{ color: 'var(--color-text-main)', position: 'relative' }}>
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </Link>
          <button className="mobile-menu-btn" style={{ color: 'var(--color-text-main)' }} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1rem 2rem', borderTop: '1px solid var(--color-border)' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', listStyle: 'none', gap: '1rem' }}>
            <li><Link to="/" onClick={() => setIsOpen(false)}>Início</Link></li>
            <li><Link to="/catalogo" onClick={() => setIsOpen(false)}>Catálogo</Link></li>
            <li><Link to="/contato" onClick={() => setIsOpen(false)}>Contato</Link></li>
          </ul>
        </div>
      )}
      
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem', letterSpacing: '1px' }}>ALPHA OUTLET</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Elevando seu estilo com peças exclusivas. Onde a moda encontra a autenticidade rústica.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Links Úteis</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
            <li><Link to="/catalogo">Nossa Coleção</Link></li>
            <li><Link to="/contato">Fale Conosco</Link></li>
            <li>Trocas e Devoluções</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Siga-nos</h4>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)' }}>
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>
      <div className="container" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
        &copy; {new Date().getFullYear()} Alpha Outlet. Todos os direitos reservados.
      </div>
    </footer>
  );
}

function App() {
  return (
    <CustomerProvider>
      <CartProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '80px' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/produto/:id" element={<ProductDetail />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/conta" element={<Account />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </CustomerProvider>
  );
}

export default App;
