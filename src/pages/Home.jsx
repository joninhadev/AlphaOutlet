import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useState, useEffect } from 'react';

export default function Home() {
  const [destaques, setDestaques] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDestaques(data.slice(0, 3));
        } else {
          setDestaques([]);
          console.error("Backend error:", data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: '80vh', 
        display: 'flex', 
        alignItems: 'center',
        backgroundImage: 'linear-gradient(to right, rgba(13,13,13,0.92), rgba(13,13,13,0.4)), url(https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container animate-fade-in">
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '1rem', maxWidth: '600px' }}>
            Vista o que<br/>te representa.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
            Multi marcas, preço justo e estilo pra todo dia. A Alpha Outlet é pra quem vive moda de verdade.
          </p>
          <Link to="/catalogo" className="btn-primary" style={{ display: 'inline-flex', padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Ver Coleção <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Destaques */}
      <section className="container" style={{ padding: '5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Destaques</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>As peças mais desejadas da nossa coleção.</p>
          </div>
          <Link to="/catalogo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid-responsive grid-responsive-3">
          {destaques.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      {/* Categoria Banner */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: '5rem 0' }}>
        <div className="container">
          <div className="glass-panel grid-responsive grid-responsive-2" style={{ borderRadius: '12px', overflow: 'hidden', gap: 0 }}>
            <div style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Novidades Toda Semana</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Peças das melhores marcas chegando o tempo todo. Camisetas, calças, tênis e acessórios com preço que cabe no bolso.
              </p>
              <Link to="/catalogo" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Conferir Lançamentos
              </Link>
            </div>
            <div style={{ height: '100%', minHeight: '300px' }}>
              <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Novidades" style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
