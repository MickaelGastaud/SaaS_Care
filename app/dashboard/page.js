'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mesTaches, setMesTaches] = useState([]);
  const [stats, setStats] = useState({
    beneficiaires: 0,
    auxiliaires: 0,
    rdvAujourdhui: 0,
    taches: 0,
    rdvMois: 0
  });
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const currentUser = JSON.parse(userData || '{}');
    setUser(currentUser);
    
    // Charger les statistiques
    const benef = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    const avs = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    const rdv = JSON.parse(localStorage.getItem('rendezvous') || '[]');
    const taches = JSON.parse(localStorage.getItem('taches') || '[]');
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const rdvToday = rdv.filter(r => r.date === today);
    const rdvMonth = rdv.filter(r => {
      const rdvDate = new Date(r.date);
      return rdvDate.getMonth() === currentMonth;
    });
    
    // Filtrer les tâches assignées à l'utilisateur courant (non terminées)
    const userName = currentUser?.name || 'Moi';
    const tachesUser = taches.filter(t => 
      t.assigne === userName && t.status !== 'terminee'
    );
    
    setMesTaches(tachesUser);
    
    setStats({
      beneficiaires: benef.length,
      auxiliaires: avs.length,
      rdvAujourdhui: rdvToday.length,
      taches: tachesUser.length,
      rdvMois: rdvMonth.length
    });
  }, []);
  
  // Fonction pour marquer une tâche comme terminée
  const terminerTache = (id) => {
    const taches = JSON.parse(localStorage.getItem('taches') || '[]');
    const updated = taches.map(t => 
      t.id === id ? { ...t, status: 'terminee' } : t
    );
    localStorage.setItem('taches', JSON.stringify(updated));
    
    const userName = user?.name || 'Moi';
    const tachesUser = updated.filter(t => 
      t.assigne === userName && t.status !== 'terminee'
    );
    setMesTaches(tachesUser);
    setStats(prev => ({ ...prev, taches: tachesUser.length }));
  };
  
  // Fonction pour calculer les jours restants
  const getDelayInfo = (dateLimit) => {
    if (!dateLimit) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(dateLimit);
    limit.setHours(0, 0, 0, 0);
    const diffTime = limit - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Dépassé', color: 'bg-red-500 text-white', isOverdue: true };
    } else if (diffDays === 0) {
      return { text: "Aujourd'hui", color: 'bg-orange-500 text-white', isOverdue: false };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}j`, color: 'bg-yellow-500 text-white', isOverdue: false };
    }
    return { text: `${diffDays}j`, color: 'bg-gray-200 text-gray-600', isOverdue: false };
  };
  
  return (
    <>
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
            <button 
              onClick={() => router.push('/dashboard/taches')}
              className="text-sm text-gray-600 hover:text-[#d85940]"
            >
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
              <span className="text-sm text-gray-500">
                Mes tâches ({mesTaches.length})
              </span>
              <button
                onClick={() => router.push('/dashboard/taches')}
                className="text-sm text-[#d85940] hover:underline"
              >
                Voir toutes →
              </button>
            </div>
          </div>
          
          {mesTaches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-medium">Aucune tâche pour vous !</p>
              <p className="text-sm">Toutes vos tâches sont terminées ou aucune ne vous est assignée.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mesTaches.slice(0, 5).map(tache => {
                const delayInfo = getDelayInfo(tache.dateLimit);
                const beneficiaires = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
                const auxiliaires = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
                const client = tache.type === 'beneficiaire' 
                  ? beneficiaires.find(b => b.id == tache.clientId)
                  : auxiliaires.find(a => a.id == tache.clientId);
                
                return (
                  <div 
                    key={tache.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      delayInfo?.isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    } hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        tache.status === 'en_cours' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-800">{tache.titre}</p>
                        <p className="text-xs text-gray-500">
                          {client ? `${client.prenom} ${client.nom}` : 'Non assigné'}
                          {tache.dateLimit && (
                            <span className="ml-2">
                              • Échéance: {new Date(tache.dateLimit).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {delayInfo && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${delayInfo.color}`}>
                          {delayInfo.isOverdue && '⚠️ '}{delayInfo.text}
                        </span>
                      )}
                      <button
                        onClick={() => terminerTache(tache.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Marquer comme terminée"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/taches')}
                        className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        →
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {mesTaches.length > 5 && (
                <button
                  onClick={() => router.push('/dashboard/taches')}
                  className="w-full text-center py-3 text-[#d85940] hover:bg-[#d85940]/5 rounded-lg transition-colors"
                >
                  Voir les {mesTaches.length - 5} autres tâches →
                </button>
              )}
            </div>
          )}
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
          
          <button 
            onClick={() => router.push('/dashboard/taches')}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-3xl mb-3">📋</div>
            <h4 className="font-bold text-gray-800">Nouvelle Tâche</h4>
            <p className="text-sm text-gray-500 mt-1">Créer une tâche à assigner</p>
          </button>
        </div>
      </div>
    </>
  );
}