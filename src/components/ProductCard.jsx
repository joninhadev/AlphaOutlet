import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="glass-panel animate-fade-in" style={{ borderRadius: '8px', overflow: 'hidden', transition: 'transform var(--transition-fast)' }}
         onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
         onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <Link to={`/produto/${product.id}`} style={{ display: 'block' }}>
        <div style={{ height: '300px', overflow: 'hidden' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-normal)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            {product.category}
          </p>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </Link>
    </div>
  );
}
