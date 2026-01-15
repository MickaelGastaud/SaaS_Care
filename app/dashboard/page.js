'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/');
      return;
    }
    
    setUser(JSON.parse(userData));
  }, []);
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-[#d85940] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CP</span>
            </div>
            <h1 className="text-xl font-bold">Care-Pilot</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Déconnexion
          </button>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b px-6 py-3">
        <div className="flex space-x-6">
          <button className="text-[#d85940] font-semibold">Tableau de bord</button>
          <button onClick={() => router.push('/dashboard/beneficiaires')} className="text-gray-600 hover:text-gray-900">Bénéficiaires</button>
          <button onClick={() => router.push('/dashboard/auxiliaires')}  className="text-gray-600 hover:text-gray-900">Auxiliaires</button>
          <button onClick={() => router.push('/dashboard/planning')} className="text-gray-600 hover:text-gray-900">Planning</button>
        </div>
      </nav>
      
      {/* Contenu principal */}
      <main className="p-6">
        <h2 className="text-2xl font-bold mb-6">Bienvenue {user?.name} !</h2>
        
        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Bénéficiaires</p>
            <p className="text-3xl font-bold text-[#d85940]">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Auxiliaires</p>
            <p className="text-3xl font-bold text-[#74ccc3]">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">RDV aujourd'hui</p>
            <p className="text-3xl font-bold text-[#a5fce8]">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Tâches</p>
            <p className="text-3xl font-bold text-gray-800">0</p>
          </div>
        </div>
        
        {/* Actions rapides */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="flex space-x-4">
            <button className="bg-[#d85940] text-white px-4 py-2 rounded hover:bg-[#c04330]">
              + Nouveau bénéficiaire
            </button>
            <button onClick={() => router.push('/dashboard/auxiliaires/nouveau')}
            className="bg-[#74ccc3] text-white px-4 py-2 rounded hover:bg-[#5cb8ae]">
              + Nouvel auxiliaire
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}