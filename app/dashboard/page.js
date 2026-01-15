'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState({
    beneficiaires: 0,
    auxiliaires: 0,
    rdvAujourdhui: 0,
    taches: 0,
    rdvMois: 0
  });
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Charger les statistiques
    const benef = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    const avs = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    const rdv = JSON.parse(localStorage.getItem('rendezvous') || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const rdvToday = rdv.filter(r => r.date === today);
    const rdvMonth = rdv.filter(r => {
      const rdvDate = new Date(r.date);
      return rdvDate.getMonth() === currentMonth;
    });
    
    setStats({
      beneficiaires: benef.length,
      auxiliaires: avs.length,
      rdvAujourdhui: rdvToday.length,
      taches: 0,
      rdvMois: rdvMonth.length
    });
  }, []);
  
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };
  
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊', path: '/dashboard' },
    { id: 'beneficiaires', label: 'Bénéficiaires', icon: '👥', path: '/dashboard/beneficiaires' },
    { id: 'auxiliaires', label: 'Auxiliaires de vie', icon: '🏥', path: '/dashboard/auxiliaires' },
    { id: 'planning', label: 'Planning', icon: '📅', path: '/dashboard/planning' },
    { id: 'taches', label: 'Tâches', icon: '✅', path: '#' },
    { id: 'seniorassist', label: 'SeniorAssist', icon: '📹', path: '#' },
    { id: 'administration', label: 'Administration', icon: '⚙️', path: '#' },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: '👤', path: '#' },
    { id: 'ca', label: "Chiffre d'Affaires", icon: '💰', path: '#' },
    { id: 'automatisations', label: 'Automatisations', icon: '🔄', path: '#' },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d85940] to-[#c04330] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">CP</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Care-Pilot</h1>
              <p className="text-xs text-gray-500">Care Management</p>
            </div>
          </div>
        </div>
        
        {/* Instance active */}
        <div className="px-4 py-3 bg-green-50 border-b">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-700 font-medium">Instance active</span>
          </div>
        </div>
        
        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                if (item.path !== '#') router.push(item.path);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                activeMenu === item.id
                  ? 'bg-[#d85940] bg-opacity-10 text-[#d85940] border-l-4 border-[#d85940]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Profil utilisateur */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#74ccc3] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600"
              title="Déconnexion"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
            <p className="text-sm text-gray-500">Vue d'ensemble de votre activité</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/beneficiaires/nouveau')}
            className="bg-[#d85940] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#c04330]"
          >
            <span>+</span>
            <span>Nouveau Bénéficiaire</span>
          </button>
        </header>
        
        {/* Contenu */}
        <div className="p-6">
          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Bénéficiaires</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.beneficiaires}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <button 
                onClick={() => router.push('/dashboard/beneficiaires')}
                className="text-sm text-gray-600 hover:text-[#d85940]"
              >
                Voir détails →
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Auxiliaires de vie</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.auxiliaires}</p>
                </div>
                <div className="text-3xl">🏥</div>
              </div>
              <button 
                onClick={() => router.push('/dashboard/auxiliaires')}
                className="text-sm text-gray-600 hover:text-[#d85940]"
              >
                Voir détails →
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">Mes Tâches</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.taches}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
              <button className="text-sm text-gray-600 hover:text-[#d85940]">
                Voir détails →
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold">RDV ce mois</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.rdvMois}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
              <button 
                onClick={() => router.push('/dashboard/planning')}
                className="text-sm text-gray-600 hover:text-[#d85940]"
              >
                Voir détails →
              </button>
            </div>
          </div>
          
          {/* Section Tâches */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Tâches</h3>
              <div className="flex items-center space-x-4">
                <select className="text-sm border rounded-lg px-3 py-1">
                  <option>Mes tâches (0)</option>
                  <option>Toutes les tâches</option>
                </select>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" />
                  Terminées
                </label>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-medium">Aucune tâche pour vous !</p>
              <p className="text-sm">Toutes vos tâches sont terminées ou aucune ne vous est assignée.</p>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => router.push('/dashboard/beneficiaires/nouveau')}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-3xl mb-3">👥</div>
              <h4 className="font-bold text-gray-800">Nouveau Bénéficiaire</h4>
              <p className="text-sm text-gray-500 mt-1">Ajouter un patient au système</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/auxiliaires/nouveau')}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-3xl mb-3">🏥</div>
              <h4 className="font-bold text-gray-800">Nouvel AVS</h4>
              <p className="text-sm text-gray-500 mt-1">Enregistrer un auxiliaire de vie</p>
            </button>
            
            <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow text-left">
              <div className="text-3xl mb-3">💰</div>
              <h4 className="font-bold text-gray-800">Facturation</h4>
              <p className="text-sm text-gray-500 mt-1">Générer les récapitulatifs mensuels</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}