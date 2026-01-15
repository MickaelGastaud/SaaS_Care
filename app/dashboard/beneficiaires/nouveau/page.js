'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NouveauBeneficiairePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    civilite: 'M.',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
    codePostal: '',
    ville: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Récupérer les bénéficiaires existants
    const existingBenef = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    
    // Ajouter le nouveau
    const newBenef = {
      ...formData,
      id: Date.now(),
      status: 'actif',
      createdAt: new Date().toISOString()
    };
    
    existingBenef.push(newBenef);
    localStorage.setItem('beneficiaires', JSON.stringify(existingBenef));
    
    alert('✅ Bénéficiaire créé !');
    router.push('/dashboard/beneficiaires');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4">
        <h1 className="text-2xl font-bold">Nouveau Bénéficiaire</h1>
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
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input
                type="tel"
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
                placeholder="email@exemple.fr"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Code Postal*</label>
              <input
                type="text"
                required
                value={formData.codePostal}
                onChange={(e) => setFormData({...formData, codePostal: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="75000"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Adresse*</label>
              <input
                type="text"
                required
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="123 rue de la Santé"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ville*</label>
              <input
                type="text"
                required
                value={formData.ville}
                onChange={(e) => setFormData({...formData, ville: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Paris"
              />
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button 
              type="submit"
              className="bg-[#d85940] text-white px-6 py-2 rounded hover:bg-[#c04330]"
            >
              Enregistrer
            </button>
            <button 
              type="button"
              onClick={() => router.push('/dashboard/beneficiaires')}
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