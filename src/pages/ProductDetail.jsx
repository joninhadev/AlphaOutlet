import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3001/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
          setSelectedSize(data.sizes[0]);
          setSelectedColor(data.colors[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedSize, selectedColor);
      alert('Adicionado ao carrinho!');
      navigate('/checkout');
    }
  };

  if (loading) return <div className="container" style={{ padding: '10rem 2rem', textAlign: 'center' }}>Carregando...</div>;

  if (!product) {
    return (
      <div className="container" style={{ padding: '10rem 2rem', textAlign: 'center' }}>
        <h2>Produto não encontrado.</h2>
        <Link to="/catalogo" className="btn-primary" style={{ marginTop: '2rem' }}>Voltar ao Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <Link to="/catalogo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={20} /> Voltar
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem' }}>
        {/* Image Gallery (Placeholder for one image) */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '600px' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
            {product.category}
          </p>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{product.name}</h1>
          <p style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>
            R$ {product.price.toFixed(2).replace('.', ',')}
          </p>
          
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: 1.8 }}>
            {product.description}
          </p>

          {/* Selections */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Tamanho</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    border: `1px solid ${selectedSize === size ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: '4px',
                    color: selectedSize === size ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontWeight: selectedSize === size ? 600 : 400
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Cor</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {product.colors.map(color => (
                <button 
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    border: `1px solid ${selectedColor === color ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: '4px',
                    color: selectedColor === color ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontWeight: selectedColor === color ? 600 : 400
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleAddToCart} className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
            <ShoppingBag size={20} /> Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
