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
        backgroundImage: 'linear-gradient(to right, rgba(13,13,13,0.9), rgba(13,13,13,0.3)), url(https://images.unsplash.com/photo-1516257984-b1b4d707412e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="container animate-fade-in">
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '1rem', maxWidth: '600px' }}>
            Estilo, <br/>Atitude & Confiança.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
            Descubra a nova coleção da Alpha Outlet. Peças desenhadas para quem valoriza a durabilidade e o design singular.
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {destaques.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      
      {/* Categoria Banner */}
      <section style={{ backgroundColor: 'var(--color-surface)', padding: '5rem 0' }}>
        <div className="container">
          <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Coleção Couro Premium</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Conheça nossa linha de jaquetas de couro autêntico, tratadas artesanalmente para um visual único que melhora com o tempo.
              </p>
              <Link to="/catalogo" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Explorar Linha
              </Link>
            </div>
            <div style={{ height: '400px' }}>
              <img src="https://images.unsplash.com/photo-1489987707023-af66f1e8e4db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Coleção Couro" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
