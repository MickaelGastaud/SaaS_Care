'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TachesModule from '@/components/modules/TachesModule';

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
  TrendUp: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

// ============================================
// CONFIGURATION
// ============================================
const EVENT_TYPE_COLORS = {
  rdv_medical: 'bg-red-500',
  intervention_avs: 'bg-green-500',
  kine: 'bg-blue-500',
  infirmier: 'bg-purple-500',
  reunion: 'bg-yellow-500',
  administratif: 'bg-gray-500',
  conge: 'bg-orange-500',
  autre: 'bg-slate-500'
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [rdvSemaine, setRdvSemaine] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    beneficiaires: 0,
    auxiliaires: 0,
    tachesEnCours: 0,
    tachesUrgentes: 0,
    rdvMois: 0,
    rdvAujourdhui: 0
  });
  const [tendances, setTendances] = useState({
    beneficiaires: 0,
    auxiliaires: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const currentUser = JSON.parse(userData || '{}');
    setUser(currentUser);

    // Charger les données
    const benef = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    const avs = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    const allTaches = JSON.parse(localStorage.getItem('taches') || '[]');

    // Charger tous les événements
    const eventsBenef = JSON.parse(localStorage.getItem('events_beneficiaires') || '{}');
    const eventsAvs = JSON.parse(localStorage.getItem('events_avss') || '{}');

    let allEvents = [];
    Object.values(eventsBenef).forEach(events => {
      allEvents = [...allEvents, ...events];
    });
    Object.values(eventsAvs).forEach(events => {
      allEvents = [...allEvents, ...events];
    });

    // Dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();

    // Stats événements
    const rdvToday = allEvents.filter(e => e.date === todayStr);
    const rdvMonth = allEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === currentMonth;
    });

    // Tâches
    const tachesEnCours = allTaches.filter(t => t.status !== 'terminee');
    const tachesUrgentes = tachesEnCours.filter(t => {
      const dateLimit = t.echeance || t.dateLimit;
      if (!dateLimit) return false;
      const limit = new Date(dateLimit);
      const diff = Math.ceil((limit - today) / (1000 * 60 * 60 * 24));
      return diff <= 2;
    });

    // RDV de la semaine
    const weekEvents = allEvents.filter(e => {
      const eventDate = new Date(e.date);
      const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    }).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.heure_debut || '').localeCompare(b.heure_debut || '');
    });
    setRdvSemaine(weekEvents.slice(0, 5));

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
    if (rdvToday.length > 0) {
      notifs.push({
        id: 2,
        type: 'info',
        message: `${rdvToday.length} rendez-vous aujourd'hui`,
        time: "Aujourd'hui"
      });
    }
    setNotifications(notifs);

    // Stats
    setStats({
      beneficiaires: benef.length,
      auxiliaires: avs.length,
      tachesEnCours: tachesEnCours.length,
      tachesUrgentes: tachesUrgentes.length,
      rdvMois: rdvMonth.length,
      rdvAujourdhui: rdvToday.length
    });

    // Tendances
    setTendances({
      beneficiaires: benef.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0,
      auxiliaires: avs.length > 0 ? Math.floor(Math.random() * 3) : 0
    });
  }, []);

  // Obtenir les jours de la semaine
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    const eventsBenef = JSON.parse(localStorage.getItem('events_beneficiaires') || '{}');
    const eventsAvs = JSON.parse(localStorage.getItem('events_avss') || '{}');
    let allEvents = [];
    Object.values(eventsBenef).forEach(events => { allEvents = [...allEvents, ...events]; });
    Object.values(eventsAvs).forEach(events => { allEvents = [...allEvents, ...events]; });

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const rdvCount = allEvents.filter(e => e.date === dateStr).length;

      days.push({
        name: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: dateStr,
        isToday: i === 0,
        rdvCount
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

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
                Bonjour {user?.name || 'Utilisateur'}, voici votre activité
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
      <div className="p-6">

        {/* ============================================ */}
        {/* SECTION : Tâches (pleine largeur) */}
        {/* ============================================ */}
        <div className="mb-8">
          <TachesModule maxRows={8} />
        </div>

        {/* ============================================ */}
        {/* SECTION : Planning (sous les tâches) */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icons.Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Cette semaine</h3>
              </div>
              <button
                onClick={() => router.push('/dashboard/planning')}
                className="text-sm text-[#d85940] hover:text-[#c04330] font-medium"
              >
                Voir le planning complet →
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Mini calendrier semaine - responsive */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`text-center p-3 rounded-xl cursor-pointer transition-all ${
                    day.isToday
                      ? 'bg-[#d85940] text-white shadow-lg scale-105'
                      : 'hover:bg-gray-100 bg-gray-50'
                  }`}
                  onClick={() => router.push('/dashboard/planning')}
                >
                  <p className={`text-xs font-medium ${day.isToday ? 'text-white/80' : 'text-gray-500'}`}>
                    {day.name}
                  </p>
                  <p className={`text-xl font-bold ${day.isToday ? 'text-white' : 'text-gray-800'}`}>
                    {day.date}
                  </p>
                  {day.rdvCount > 0 && (
                    <div className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                      day.isToday ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {day.rdvCount} rdv
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Liste RDV à venir - en grille sur grand écran */}
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Prochains RDV</p>
              {rdvSemaine.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Icons.Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun RDV cette semaine</p>
                  <button 
                    onClick={() => router.push('/dashboard/planning')}
                    className="mt-3 text-sm text-[#d85940] hover:text-[#c04330] font-medium"
                  >
                    Planifier un RDV →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rdvSemaine.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
                      onClick={() => router.push('/dashboard/planning')}
                    >
                      <div className={`w-1.5 h-12 rounded-full ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-400'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{event.titre}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {event.heure_debut && ` • ${event.heure_debut}`}
                        </p>
                      </div>
                      <Icons.ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* ACTIONS RAPIDES */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-[#d85940]/10 rounded-lg">
              <Icons.Activity className="w-5 h-5 text-[#d85940]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Actions rapides</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/dashboard/beneficiaires/nouveau')}
              className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                <Icons.Beneficiaires />
              </div>
              <span className="font-medium text-gray-800 text-center">Nouveau Bénéficiaire</span>
              <span className="text-xs text-gray-500 mt-1">Ajouter un patient</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/auxiliaires/nouveau')}
              className="flex flex-col items-center p-6 bg-[#74ccc3]/10 hover:bg-[#74ccc3]/20 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-[#74ccc3] rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                <Icons.Auxiliaires />
              </div>
              <span className="font-medium text-gray-800 text-center">Nouvel Auxiliaire</span>
              <span className="text-xs text-gray-500 mt-1">Enregistrer un AVS</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/taches')}
              className="flex flex-col items-center p-6 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                <Icons.Taches />
              </div>
              <span className="font-medium text-gray-800 text-center">Nouvelle Tâche</span>
              <span className="text-xs text-gray-500 mt-1">Créer une tâche</span>
            </button>

            <button
              onClick={() => router.push('/dashboard/planning')}
              className="flex flex-col items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                <Icons.Calendar />
              </div>
              <span className="font-medium text-gray-800 text-center">Nouveau RDV</span>
              <span className="text-xs text-gray-500 mt-1">Planifier un rendez-vous</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}