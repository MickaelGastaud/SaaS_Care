'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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
  
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊', path: '/dashboard' },
    { id: 'beneficiaires', label: 'Bénéficiaires', icon: '👥', path: '/dashboard/beneficiaires' },
    { id: 'auxiliaires', label: 'Auxiliaires de vie', icon: '🏥', path: '/dashboard/auxiliaires' },
    { id: 'planning', label: 'Planning', icon: '📅', path: '/dashboard/planning' },
    { id: 'taches', label: 'Tâches', icon: '✅', path: '/dashboard/taches' },
    { id: 'seniorassist', label: 'SeniorAssist', icon: '📹', path: '/dashboard/seniorassist' },
    { id: 'administration', label: 'Administration', icon: '⚙️', path: '/dashboard/administration' },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: '👤', path: '/dashboard/utilisateurs' },
    { id: 'ca', label: "Chiffre d'Affaires", icon: '💰', path: '/dashboard/chiffre-affaires' },
    { id: 'automatisations', label: 'Automatisations', icon: '🔄', path: '/dashboard/automatisations' },
  ];
  
  // Déterminer quel menu est actif selon l'URL
  const getActiveMenu = () => {
    const current = menuItems.find(item => pathname.startsWith(item.path) && item.path !== '/dashboard');
    if (current) return current.id;
    if (pathname === '/dashboard') return 'dashboard';
    return 'dashboard';
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 relative flex flex-col flex-shrink-0`}>
        
        {/* Bouton Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-[#d85940] hover:border-[#d85940] transition-colors z-10"
          title={sidebarOpen ? 'Réduire le menu' : 'Agrandir le menu'}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Logo */}
        <div className="p-4 border-b">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#d85940] to-[#c04330] rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => router.push('/dashboard')}>
              <span className="text-white text-xl font-bold">CP</span>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden cursor-pointer" onClick={() => router.push('/dashboard')}>
                <h1 className="font-bold text-gray-800 whitespace-nowrap">Care-Pilot</h1>
                <p className="text-xs text-gray-500 whitespace-nowrap">Care Management</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Instance active */}
        <div className={`px-4 py-3 bg-green-50 border-b ${!sidebarOpen && 'flex justify-center'}`}>
          <div className={`flex items-center text-sm ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
            {sidebarOpen && <span className="text-green-700 font-medium whitespace-nowrap">Instance active</span>}
          </div>
        </div>
        
        {/* Menu */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = getActiveMenu() === item.id;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#d85940] bg-opacity-10 text-[#d85940] border-l-4 border-[#d85940]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        {/* Profil utilisateur */}
        <div className="p-4 border-t bg-white mt-auto">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : ''}`}>
              <div className="w-10 h-10 bg-[#74ccc3] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{user?.name}</p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">{user?.role}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Déconnexion"
              >
                🚪
              </button>
            )}
          </div>
          {!sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full mt-2 text-gray-400 hover:text-red-500 flex justify-center transition-colors"
              title="Déconnexion"
            >
              🚪
            </button>
          )}
        </div>
      </aside>
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}