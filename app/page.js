'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Pour l'instant, on teste juste l'affichage
    console.log('Tentative de connexion:', email);
    setTimeout(() => {
      alert('Connexion simulée ! On va ajouter la vraie API après.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d85940] to-[#74ccc3] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#d85940] to-[#c04330] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">CP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Care-Pilot</h1>
          <p className="text-gray-600 mt-2">Gestion de soins simplifiée</p>
        </div>
        
        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email professionnel
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#74ccc3] transition-colors"
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#74ccc3] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d85940] text-white py-3 rounded-lg hover:bg-[#c04330] transition-colors font-semibold text-lg disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 Care-Pilot - Solution HDS</p>
          <p>Dev.par Mickael Gastaud</p>
        </div>
      </div>
    </div>
  );
}