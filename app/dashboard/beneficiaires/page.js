'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BeneficiairesPage() {
  const router = useRouter();
  const [beneficiaires, setBeneficiaires] = useState([]);

  useEffect(() => {
    // Charger depuis localStorage
    const saved = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    setBeneficiaires(saved);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bénéficiaires</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </button>
        </div>
      </header>
      
      {/* Liste */}
      <main className="p-6">
        <button 
          onClick={() => router.push('/dashboard/beneficiaires/nouveau')}
          className="bg-[#d85940] text-white px-4 py-2 rounded mb-4 hover:bg-[#c04330]"
        >
          + Nouveau bénéficiaire
        </button>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {beneficiaires.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              Aucun bénéficiaire enregistré. Cliquez sur "+ Nouveau bénéficiaire" pour commencer.
            </p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Civilité</th>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Prénom</th>
                  <th className="p-3 text-left">Téléphone</th>
                  <th className="p-3 text-left">Ville</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaires.map(b => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{b.civilite}</td>
                    <td className="p-3 font-semibold">{b.nom}</td>
                    <td className="p-3">{b.prenom}</td>
                    <td className="p-3">{b.telephone || '-'}</td>
                    <td className="p-3">{b.ville}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {b.status || 'actif'}
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="text-[#74ccc3] hover:text-[#5cb8ae]">
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Statistiques */}
        <div className="mt-6 text-sm text-gray-600">
          Total : {beneficiaires.length} bénéficiaire(s)
        </div>
      </main>
    </div>
  );
}