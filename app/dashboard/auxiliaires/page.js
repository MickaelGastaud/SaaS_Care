'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuxiliairesPage() {
  const router = useRouter();
  const [auxiliaires, setAuxiliaires] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    setAuxiliaires(saved);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Auxiliaires de Vie</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Retour
          </button>
        </div>
      </header>
      
      <main className="p-6">
        <button 
          onClick={() => router.push('/dashboard/auxiliaires/nouveau')}
          className="bg-[#74ccc3] text-white px-4 py-2 rounded mb-4 hover:bg-[#5cb8ae]"
        >
          + Nouvel auxiliaire
        </button>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {auxiliaires.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              Aucun auxiliaire enregistré.
            </p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Prénom</th>
                  <th className="p-3 text-left">Téléphone</th>
                  <th className="p-3 text-left">Taux horaire</th>
                  <th className="p-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {auxiliaires.map(a => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-semibold">{a.nom}</td>
                    <td className="p-3">{a.prenom}</td>
                    <td className="p-3">{a.telephone || '-'}</td>
                    <td className="p-3">{a.tauxHoraire}€/h</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}