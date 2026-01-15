'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanningPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Configuration des types de RDV avec couleurs
  const typeConfig = {
    medical: { label: 'Médical / RDV ponctuel', color: 'bg-red-500', symbol: '🔴' },
    avs_cesu: { label: 'Auxiliaire CESU', color: 'bg-blue-500', symbol: '🔵' },
    kine: { label: 'Kinésithérapeute', color: 'bg-green-500', symbol: '🟢' },
    infirmiere: { label: 'Infirmière', color: 'bg-yellow-400', symbol: '🟡' },
    visite: { label: 'Visite client', color: 'bg-cyan-300', symbol: '💎' },
    repas: { label: 'Repas', color: 'bg-gray-800', symbol: '⚫' },
    avs_prestataire: { label: 'AVS Prestataire', color: 'bg-lime-400', symbol: '🌿' },
    ordonnance: { label: 'Renouvellement Ordonnance', color: 'bg-purple-500', symbol: '🟣' },
    conges: { label: 'Congés AVS', color: 'bg-orange-500', symbol: '🟠' }
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('rendezvous') || '[]');
    setRendezVous(saved);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay() || 7;

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const days = [];
  for (let i = 1; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(new Date(year, month, day));
      setShowModal(true);
    }
  };

  const getRdvForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return rendezVous.filter(rdv => rdv.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">📅 Planning</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </button>
        </div>
      </header>
      
      <main className="p-6">
        {/* Légende */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-bold mb-3">Légende :</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {Object.entries(typeConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`inline-block w-4 h-4 rounded-full ${config.color}`}></span>
                <span>{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation du calendrier */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-center items-center gap-4 mb-4">
            <button 
              onClick={prevMonth}
              className="bg-[#74ccc3] text-white px-3 py-1 rounded hover:bg-[#5cb8ae]"
            >
              ◀
            </button>
            <h2 className="text-xl font-bold">
              {monthNames[month]} {year}
            </h2>
            <button 
              onClick={nextMonth}
              className="bg-[#74ccc3] text-white px-3 py-1 rounded hover:bg-[#5cb8ae]"
            >
              ▶
            </button>
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(jour => (
              <div key={jour} className="text-center font-bold text-sm py-2 bg-gray-100">
                {jour}
              </div>
            ))}
            
            {days.map((day, index) => {
              const rdvs = getRdvForDay(day);
              const isToday = day === new Date().getDate() && 
                            month === new Date().getMonth() && 
                            year === new Date().getFullYear();
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[100px] p-2 border cursor-pointer hover:bg-gray-50
                    ${isToday ? 'bg-[#a5fce8] bg-opacity-30 border-2 border-[#74ccc3]' : ''}
                    ${!day ? 'bg-gray-50 cursor-default' : ''}
                  `}
                >
                  {day && (
                    <>
                      <div className="font-semibold text-sm mb-1">{day}</div>
                      <div className="space-y-1">
                        {rdvs.slice(0, 3).map((rdv, i) => {
                          const config = typeConfig[rdv.type] || { color: 'bg-gray-400' };
                          return (
                            <div key={i} className="flex items-center gap-1">
                              <span className={`inline-block w-2 h-2 rounded-full ${config.color}`}></span>
                              <span className="text-xs truncate">{rdv.heure}</span>
                            </div>
                          );
                        })}
                        {rdvs.length > 3 && (
                          <div className="text-xs text-gray-500 font-semibold">
                            +{rdvs.length - 3} autres
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal pour nouveau RDV */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">
                📅 {selectedDate?.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h3>
              
              <div className="space-y-2 mb-4">
                {getRdvForDay(selectedDate?.getDate()).length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">RDV existants :</p>
                    {getRdvForDay(selectedDate?.getDate()).map((rdv, i) => (
                      <div key={i} className="p-2 bg-gray-100 rounded text-sm">
                        <span className="font-semibold">{rdv.heure}</span> - {typeConfig[rdv.type]?.label}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun RDV ce jour</p>
                )}
              </div>
              
              <button 
                onClick={() => router.push(`/dashboard/planning/nouveau?date=${selectedDate?.toISOString()}`)}
                className="bg-[#d85940] text-white px-4 py-2 rounded w-full mb-2 hover:bg-[#c04330]"
              >
                + Ajouter un rendez-vous
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded w-full hover:bg-gray-400"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}