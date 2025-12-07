export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🍳 Recipe Unifier Backend
      </h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
        AI-Powered Recipe Parser API
      </p>
      <div style={{ 
        marginTop: '2rem', 
        padding: '2rem', 
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>API Endpoints:</h2>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.2rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            ✅ <a href="/api/health" style={{ color: '#ffd700' }}>/api/health</a> - Health check
          </li>
          <li>
            🔧 <span style={{ color: '#ffd700' }}>/api/parse</span> - Parse recipe from URL
          </li>
        </ul>
      </div>
      <p style={{ marginTop: '2rem', opacity: 0.7, fontSize: '0.9rem' }}>
        Powered by OpenAI GPT-4 | Built with Next.js 14
      </p>
    </div>
  );
}
