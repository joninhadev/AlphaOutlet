import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Fale Conosco</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Dúvidas, sugestões ou interesse em parcerias comerciais? Preencha o formulário ou use nossos canais de atendimento.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem' }}>
        {/* Info Sidebar */}
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Informações de Contato</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '50%' }}>
                <Phone size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontSize: '1rem' }}>Telefone / WhatsApp</h5>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>(11) 99999-9999</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '50%' }}>
                <Mail size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontSize: '1rem' }}>Email</h5>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>contato@alphaoutlet.com.br</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '50%' }}>
                <MapPin size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h5 style={{ margin: 0, fontSize: '1rem' }}>Endereço (Showroom)</h5>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Rua Augusta, 1234 - São Paulo, SP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="name" style={{ fontWeight: 500 }}>Nome Completo</label>
              <input 
                type="text" 
                id="name" 
                style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '6px',
                  color: '#fff',
                  outline: 'none'
                }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="email" style={{ fontWeight: 500 }}>Email</label>
              <input 
                type="email" 
                id="email" 
                style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '6px',
                  color: '#fff',
                  outline: 'none'
                }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="message" style={{ fontWeight: 500 }}>Mensagem</label>
              <textarea 
                id="message" 
                rows={5}
                style={{ 
                  padding: '1rem', 
                  backgroundColor: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: '6px',
                  color: '#fff',
                  outline: 'none',
                  resize: 'vertical'
                }} 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1.2rem' }}>
              Enviar Mensagem
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
