'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TachesModule from '@/components/modules/TachesModule';
import EvenementsModule from '@/components/modules/EvenementsModule';
import CalendrierModule from '@/components/modules/CalendrierModule';

// ============================================
// ICÔNES SVG
// ============================================
const Icons = {
  Beneficiaires: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Auxiliaires: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Taches: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Calendar: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Bell: ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Warning: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const currentUser = JSON.parse(userData || '{}');
    setUser(currentUser);

    // Charger les tâches pour les notifications
    const allTaches = JSON.parse(localStorage.getItem('taches') || '[]');
    const today = new Date();
    
    const tachesEnCours = allTaches.filter(t => t.status !== 'terminee');
    const tachesUrgentes = tachesEnCours.filter(t => {
      const dateLimit = t.echeance || t.dateLimit;
      if (!dateLimit) return false;
      const limit = new Date(dateLimit);
      const diff = Math.ceil((limit - today) / (1000 * 60 * 60 * 24));
      return diff <= 2;
    });

    // Charger les événements calendrier pour les notifications
    const eventsBenef = JSON.parse(localStorage.getItem('events_beneficiaires') || '{}');
    const eventsAvs = JSON.parse(localStorage.getItem('events_avss') || '{}');
    let allCalendarEvents = [];
    Object.values(eventsBenef).forEach(events => { allCalendarEvents = [...allCalendarEvents, ...events]; });
    Object.values(eventsAvs).forEach(events => { allCalendarEvents = [...allCalendarEvents, ...events]; });

    // Notifications
    const notifs = [];
    if (tachesUrgentes.length > 0) {
      notifs.push({
        id: 1,
        type: 'warning',
        message: `${tachesUrgentes.length} tâche(s) urgente(s) à traiter`,
        time: 'Maintenant'
      });
    }
    const todayStr = today.toISOString().split('T')[0];
    const rdvToday = allCalendarEvents.filter(e => e.date === todayStr);
    if (rdvToday.length > 0) {
      notifs.push({
        id: 2,
        type: 'info',
        message: `${rdvToday.length} RDV aujourd'hui`,
        time: "Aujourd'hui"
      });
    }
    setNotifications(notifs);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
              <p className="text-sm text-gray-500">
                Bonjour {user?.name || 'Utilisateur'}, voici votre journée
              </p>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.Bell />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-30">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                      Aucune notification
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${notif.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                              {notif.type === 'warning' ? <Icons.Warning className="w-4 h-4" /> : <Icons.Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* CONTENU PRINCIPAL */}
      {/* ============================================ */}
      <div className="p-6 space-y-6">

        {/* ============================================ */}
        {/* SECTION 1 : ÉVÉNEMENTS */}
        {/* Bordure turquoise distinctive */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl shadow-sm border-l-4 border-[#74ccc3] overflow-hidden">
          <EvenementsModule showTitle={true} />
        </section>

        {/* ============================================ */}
        {/* SECTION 2 : TÂCHES */}
        {/* Bordure orange distinctive */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl shadow-sm border-l-4 border-[#d85940] overflow-hidden">
          <TachesModule showTitle={true} />
        </section>

        {/* ============================================ */}
        {/* SECTION 3 : CALENDRIER / PLANNING */}
        {/* Bordure violette distinctive */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 overflow-hidden">
          <CalendrierModule showTitle={true} />
        </section>

        {/* ============================================ */}
        {/* SECTION 4 : ACTIONS RAPIDES */}
        {/* ============================================ */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-[#a5fce8] rounded-lg">
              <Icons.Activity className="w-5 h-5 text-[#5cb8ae]" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Actions rapides</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/dashboard/beneficiaires/nouveau')}
              className="flex flex-col items-center p-5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/30">
                <Icons.Beneficiaires />
              </div>
              <span className="font-medium text-gray-800 text-center text-sm">Nouveau Bénéficiaire</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/auxiliaires/nouveau')}
              className="flex flex-col items-center p-5 bg-[#74ccc3]/10 hover:bg-[#74ccc3]/20 rounded-xl transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-[#74ccc3] rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-[#74ccc3]/30">
                <Icons.Auxiliaires />
              </div>
              <span className="font-medium text-gray-800 text-center text-sm">Nouvel Auxiliaire</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/taches')}
              className="flex flex-col items-center p-5 bg-[#d85940]/10 hover:bg-[#d85940]/20 rounded-xl transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-[#d85940] rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-[#d85940]/30">
                <Icons.Taches />
              </div>
              <span className="font-medium text-gray-800 text-center text-sm">Nouvelle Tâche</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/planning')}
              className="flex flex-col items-center p-5 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-purple-500/30">
                <Icons.Calendar />
              </div>
              <span className="font-medium text-gray-800 text-center text-sm">Nouveau RDV</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}