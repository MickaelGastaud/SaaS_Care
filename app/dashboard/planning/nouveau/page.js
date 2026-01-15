'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanningPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [auxiliaires, setAuxiliaires] = useState([]);
  
  const [formData, setFormData] = useState({
    type: 'avs_cesu',
    titre: '',
    beneficiaire: '',
    auxiliaire: '',
    intervenant: '',
    heureDebut: '09:00',
    heureFin: '10:00',
    recurrence: 'aucune',
    description: ''
  });

  const typeConfig = {
    medical: { label: 'Médical / RDV ponctuel', color: 'bg-red-500', symbol: '🔴' },
    avs_cesu: { label: 'AVS CESU', color: 'bg-blue-500', symbol: '🔵' },
    kine: { label: 'Kinésithérapeute', color: 'bg-green-500', symbol: '🟢' },
    infirmiere: { label: 'Infirmière', color: 'bg-yellow-400', symbol: '🟡' },
    visite: { label: 'Visite client', color: 'bg-cyan-300', symbol: '💎' },
    repas: { label: 'Repas', color: 'bg-gray-800', symbol: '⚫' },
    avs_prestataire: { label: 'AVS Prestataire', color: 'bg-lime-400', symbol: '🌿' },
    ordonnance: { label: 'Renouvellement Ordonnance', color: 'bg-purple-500', symbol: '🟣' },
    conges: { label: 'Congés AVS', color: 'bg-orange-500', symbol: '🟠' }
  };

  useEffect(() => {
    setRendezVous(JSON.parse(localStorage.getItem('rendezvous') || '[]'));
    setBeneficiaires(JSON.parse(localStorage.getItem('beneficiaires') || '[]'));
    setAuxiliaires(JSON.parse(localStorage.getItem('auxiliaires') || '[]'));
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
      setShowForm(true);
    }
  };

  const getRdvForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return rendezVous.filter(rdv => rdv.date === dateStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newRdv = {
      ...formData,
      id: Date.now(),
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
      heure: formData.heureDebut,
      createdAt: new Date().toISOString()
    };
    
    const updatedRdv = [...rendezVous, newRdv];
    localStorage.setItem('rendezvous', JSON.stringify(updatedRdv));
    setRendezVous(updatedRdv);
    
    // Reset form
    setFormData({
      type: 'avs_cesu',
      titre: '',
      beneficiaire: '',
      auxiliaire: '',
      intervenant: '',
      heureDebut: '09:00',
      heureFin: '10:00',
      recurrence: 'aucune',
      description: ''
    });
    
    setShowForm(false);
    alert('✅ Rendez-vous créé !');
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
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="bg-[#74ccc3] text-white px-3 py-1 rounded hover:bg-[#5cb8ae]"
            >
              ◀
            </button>
            <h2 className="text-xl font-bold">
              {monthNames[month]} {year}
            </h2>
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1))}
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
                            +{rdvs.length - 3}
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

        {/* Popup Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">Nouveau rendez-vous</h3>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-600 hover:text-gray-900 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                {/* Type de RDV */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Type de RDV</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  >
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.symbol} {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Titre */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Titre</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({...formData, titre: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Titre du rendez-vous"
                  />
                </div>

                {/* Bénéficiaire */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Bénéficiaire</label>
                  <select 
                    value={formData.beneficiaire}
                    onChange={(e) => setFormData({...formData, beneficiaire: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Aucun</option>
                    {beneficiaires.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.civilite} {b.prenom} {b.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AVS ou Intervenant */}
                {(formData.type === 'avs_cesu' || formData.type === 'avs_prestataire') ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">AVS assigné</label>
                    <select 
                      value={formData.auxiliaire}
                      onChange={(e) => setFormData({...formData, auxiliaire: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Aucun</option>
                      {auxiliaires.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.prenom} {a.nom}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      L'agenda de l'AVS sera automatiquement mis à jour
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Intervenant (externe)</label>
                    <input
                      type="text"
                      value={formData.intervenant}
                      onChange={(e) => setFormData({...formData, intervenant: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Ex: Kinésithérapeute, Médecin traitant..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Professionnel externe (non AVS)
                    </p>
                  </div>
                )}

                {/* Heures */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Début</label>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm">{selectedDate?.toLocaleDateString('fr-FR')}</span>
                      <input
                        type="time"
                        value={formData.heureDebut}
                        onChange={(e) => setFormData({...formData, heureDebut: e.target.value})}
                        className="border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Fin</label>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm">{selectedDate?.toLocaleDateString('fr-FR')}</span>
                      <input
                        type="time"
                        value={formData.heureFin}
                        onChange={(e) => setFormData({...formData, heureFin: e.target.value})}
                        className="border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Récurrence */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Récurrence</label>
                  <select 
                    value={formData.recurrence}
                    onChange={(e) => setFormData({...formData, recurrence: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="aucune">Aucune</option>
                    <option value="quotidienne">Quotidienne</option>
                    <option value="hebdomadaire">Hebdomadaire</option>
                    <option value="mensuelle">Mensuelle</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Notes supplémentaires..."
                  />
                </div>

                {/* Bouton */}
                <button 
                  type="submit"
                  className="w-full bg-[#d85940] text-white py-3 rounded-lg hover:bg-[#c04330] font-semibold"
                >
                  Créer
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}