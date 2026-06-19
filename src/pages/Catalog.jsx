import ProductCard from '../components/ProductCard';
import { useState, useEffect } from 'react';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  useEffect(() => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  // Extrair categorias únicas
  const categories = [...new Set(products.map(p => p.category))];

  // Filtrar produtos
  const filteredProducts = selectedCategory === 'Todas' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Nossa Coleção</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
          Explore nossa linha completa de roupas e calçados com design rústico e qualidade inigualável.
        </p>

        {/* Filtros de Categoria */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedCategory('Todas')}
            style={{ 
              padding: '0.5rem 1.5rem', 
              borderRadius: '20px', 
              border: `1px solid ${selectedCategory === 'Todas' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: selectedCategory === 'Todas' ? 'var(--color-primary)' : 'transparent',
              color: selectedCategory === 'Todas' ? '#fff' : 'var(--color-text-main)',
              transition: 'var(--transition-fast)'
            }}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ 
                padding: '0.5rem 1.5rem', 
                borderRadius: '20px', 
                border: `1px solid ${selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : 'transparent',
                color: selectedCategory === cat ? '#fff' : 'var(--color-text-main)',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem' }}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
