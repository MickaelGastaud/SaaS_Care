'use client';
import TachesModule from '@/components/modules/TachesModule';

export default function TachesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des tâches</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez et suivez toutes les tâches de votre équipe
          </p>
        </div>
      </header>

      {/* Contenu */}
      <div className="p-6">
        <TachesModule />
      </div>
    </div>
  );
}