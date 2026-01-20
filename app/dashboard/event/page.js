'use client';
import { useState, useEffect } from 'react';
import EvenementsModule from '@/components/modules/EvenementsModule';

export default function EvenementsPage() {
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, pinned: 0 });

  useEffect(() => {
    // Charger les stats
    const events = JSON.parse(localStorage.getItem('evenements') || '[]');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    setStats({
      total: events.length,
      thisMonth: events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
      }).length,
      pinned: events.filter(e => e.isPinned).length
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Événements</h1>
              <p className="text-sm text-gray-500">
                Journal des événements patients et auxiliaires
              </p>
            </div>

            {/* Mini stats */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#74ccc3]">{stats.thisMonth}</p>
                <p className="text-xs text-gray-500">Ce mois</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#d85940]">{stats.pinned}</p>
                <p className="text-xs text-gray-500">Épinglés</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <div className="p-6">
        <EvenementsModule />
      </div>
    </div>
  );
}