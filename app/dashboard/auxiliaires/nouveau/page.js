'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NouvelAuxiliairePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    civilite: 'Mme',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    tauxHoraire: '15',
    status: 'actif'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const existingAvs = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    
    const newAvs = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    existingAvs.push(newAvs);
    localStorage.setItem('auxiliaires', JSON.stringify(existingAvs));
    
    alert('✅ Auxiliaire créé !');
    router.push('/dashboard/auxiliaires');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4">
        <h1 className="text-2xl font-bold">Nouvel Auxiliaire de Vie</h1>
      </header>
      
      <main className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Civilité</label>
              <select 
                value={formData.civilite}
                onChange={(e) => setFormData({...formData, civilite: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option>M.</option>
                <option>Mme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nom*</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Prénom*</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone*</label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="06 00 00 00 00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Taux horaire (€/h)*</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.tauxHoraire}
                onChange={(e) => setFormData({...formData, tauxHoraire: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              type="submit"
              className="bg-[#74ccc3] text-white px-6 py-2 rounded hover:bg-[#5cb8ae]"
            >
              Enregistrer
            </button>
            <button 
              type="button"
              onClick={() => router.push('/dashboard/auxiliaires')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}