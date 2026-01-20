'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Composants d'icônes SVG
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  Beneficiaires: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Auxiliaires: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Planning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Taches: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Annuaire: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Outils: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  SeniorAssist: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Parametres: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
};

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
  
  // Menu organisé par sections
  const menuSections = [
    {
      title: 'Gestion',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: 'Dashboard', path: '/dashboard' },
        { id: 'beneficiaires', label: 'Bénéficiaires', icon: 'Beneficiaires', path: '/dashboard/beneficiaires' },
        { id: 'auxiliaires', label: 'Auxiliaires', icon: 'Auxiliaires', path: '/dashboard/auxiliaires' },
        { id: 'planning', label: 'Planning', icon: 'Planning', path: '/dashboard/planning' },
        { id: 'taches', label: 'Tâches', icon: 'Taches', path: '/dashboard/taches' },
      ]
    },
    {
      title: 'Ressources',
      items: [
        { id: 'annuaire', label: 'Annuaire', icon: 'Annuaire', path: '/dashboard/annuaire' },
        { id: 'outils', label: 'Nos outils', icon: 'Outils', path: '/dashboard/outils' },
      ]
    },
    {
      title: 'Services',
      items: [
        { id: 'seniorassist', label: 'SeniorAssist', icon: 'SeniorAssist', path: '/dashboard/seniorassist', badge: 'Nuit' },
      ]
    },
  ];
  
  // Déterminer quel menu est actif selon l'URL
  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };
  
  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col flex-shrink-0 relative`}>
        
        {/* Logo */}
        <div className="p-4 border-b">
          <div 
            className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} cursor-pointer`}
            onClick={() => router.push('/dashboard')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#d85940] to-[#c04330] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">CP</span>
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-gray-800 whitespace-nowrap">Care-Pilot</h1>
                <p className="text-xs text-gray-500 whitespace-nowrap">Gestion des soins</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Instance active */}
        <div className={`px-4 py-3 bg-[#74ccc3]/10 border-b ${!sidebarOpen && 'flex justify-center'}`}>
          <div className={`flex items-center text-sm ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-2 h-2 bg-[#74ccc3] rounded-full mr-2 flex-shrink-0 animate-pulse"></div>
            {sidebarOpen && <span className="text-[#5cb8ae] font-medium whitespace-nowrap">Instance active</span>}
          </div>
        </div>
        
        {/* Menu par sections */}
        <nav className="p-4 flex-1 overflow-y-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {/* Titre de section */}
              {sidebarOpen && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </p>
              )}
              {!sidebarOpen && sectionIndex > 0 && (
                <div className="border-t border-gray-200 my-3"></div>
              )}
              
              {/* Items de la section */}
              <div className="space-y-1">
                {section.items.map(item => {
                  const active = isActive(item.path);
                  const isSeniorAssist = item.id === 'seniorassist';
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg transition-all duration-200 group relative ${
                        active
                          ? isSeniorAssist 
                            ? 'bg-[#a5fce8]/30 text-[#5cb8ae]'
                            : 'bg-[#d85940]/10 text-[#d85940]'
                          : isSeniorAssist
                            ? 'text-gray-600 hover:bg-[#a5fce8]/20 hover:text-[#5cb8ae]'
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      {/* Indicateur actif */}
                      {active && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${
                          isSeniorAssist ? 'bg-[#74ccc3]' : 'bg-[#d85940]'
                        }`}></div>
                      )}
                      
                      {/* Icône */}
                      <span className={`flex-shrink-0 ${active ? '' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {renderIcon(item.icon)}
                      </span>
                      
                      {/* Label + Badge */}
                      {sidebarOpen && (
                        <div className="flex items-center justify-between flex-1">
                          <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-[#a5fce8] text-[#5cb8ae] rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* Paramètres + Profil utilisateur */}
        <div className="border-t bg-white">
          {/* Bouton Paramètres */}
          <div className="p-2">
            <button
              onClick={() => router.push('/dashboard/parametres')}
              className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors`}
              title={!sidebarOpen ? 'Paramètres' : ''}
            >
              <Icons.Parametres />
              {sidebarOpen && <span className="text-sm font-medium">Paramètres</span>}
            </button>
          </div>
          
          {/* Profil utilisateur */}
          <div className="p-4 border-t">
            <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-[#74ccc3] to-[#5cb8ae] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{user?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-500 whitespace-nowrap capitalize">{user?.role || 'Membre'}</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <Icons.Logout />
                </button>
              )}
            </div>
            {!sidebarOpen && (
              <button
                onClick={handleLogout}
                className="w-full mt-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex justify-center transition-colors"
                title="Déconnexion"
              >
                <Icons.Logout />
              </button>
            )}
          </div>
        </div>
      </aside>
      
      {/* Bouton Toggle - EN DEHORS de la sidebar pour être toujours visible */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 bg-white border border-gray-200 shadow-md rounded-full w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#d85940] hover:border-[#d85940] transition-all z-50"
        style={{ left: sidebarOpen ? '252px' : '68px' }}
        title={sidebarOpen ? 'Réduire le menu' : 'Agrandir le menu'}
      >
        <div className={`transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}>
          <Icons.ChevronLeft />
        </div>
      </button>
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}