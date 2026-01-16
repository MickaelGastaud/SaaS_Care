'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CalendrierModule from '@/components/modules/CalendrierModule';
import TachesModule from '@/components/modules/TachesModule';

// Composant Badge de statut
const StatusBadge = ({ status }) => {
  const config = {
    actif: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
    inactif: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactif' },
    prospect: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Prospect' },
    blackliste: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blacklisté' }
  };
  const style = config[status] || config.actif;
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

// Composant Section
const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// Composant Info
const InfoRow = ({ label, value, isLink = false, href = '' }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 sm:w-40 flex-shrink-0">{label}</span>
    {isLink && value ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#d85940] hover:underline">
        {value}
      </a>
    ) : (
      <span className="text-gray-800">{value || <span className="text-gray-400">-</span>}</span>
    )}
  </div>
);

// Composant Onglet
const Tab = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-[#74ccc3] text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

export default function FicheAuxiliairePage() {
  const router = useRouter();
  const params = useParams();
  const [auxiliaire, setAuxiliaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');

  useEffect(() => {
    if (params.id) {
      loadAuxiliaire();
    }
  }, [params.id]);

  const loadAuxiliaire = () => {
    const stored = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    const found = stored.find(a => a.id === params.id);
    setAuxiliaire(found || null);
    setLoading(false);
  };

  const getAvatarColor = (prenom, nom) => {
    const colors = [
      'bg-[#74ccc3]', 'bg-[#d85940]', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-blue-500', 'bg-green-500'
    ];
    const initials = `${prenom?.[0] || ''}${nom?.[0] || ''}`;
    const index = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
    return colors[index];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[#d85940] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!auxiliaire) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-5xl mb-4">😕</span>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Auxiliaire non trouvé</h2>
        <p className="text-gray-500 mb-4">Cet auxiliaire n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => router.push('/dashboard/auxiliaires')}
          className="text-[#d85940] hover:underline"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {auxiliaire.photo_url ? (
              <img 
                src={auxiliaire.photo_url} 
                alt="" 
                className="w-16 h-16 rounded-full object-cover border-4 border-[#74ccc3]" 
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${getAvatarColor(auxiliaire.prenom, auxiliaire.nom)} text-white flex items-center justify-center font-bold text-xl`}>
                {auxiliaire.prenom?.[0]}{auxiliaire.nom?.[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {auxiliaire.civilite} {auxiliaire.prenom} {auxiliaire.nom}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={auxiliaire.status || 'actif'} />
                {auxiliaire.is_motorisee && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">🚗 Motorisée</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/auxiliaires/${auxiliaire.id}/edit`)}
              className="px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>
            <button
              onClick={() => router.push('/dashboard/auxiliaires')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Boutons d'actions rapides */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          {auxiliaire.telephone && (
            <a
              href={`tel:${auxiliaire.telephone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appeler
            </a>
          )}
          
          {auxiliaire.lien_drive && (
            <a
              href={auxiliaire.lien_drive}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Drive
            </a>
          )}

          {auxiliaire.email && (
            <a
              href={`mailto:${auxiliaire.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 overflow-x-auto">
          <Tab 
            label="Informations" 
            icon="👤" 
            active={activeTab === 'infos'} 
            onClick={() => setActiveTab('infos')} 
          />
          <Tab 
            label="Calendrier" 
            icon="📅" 
            active={activeTab === 'calendrier'} 
            onClick={() => setActiveTab('calendrier')} 
          />
          <Tab 
            label="Tâches" 
            icon="✅" 
            active={activeTab === 'taches'} 
            onClick={() => setActiveTab('taches')} 
          />
        </div>
      </header>

      {/* Contenu */}
      <main className="p-6">
        
        {/* Onglet Informations */}
        {activeTab === 'infos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Colonne gauche */}
            <div className="space-y-6">
              
              {/* État civil */}
              <Section title="État civil" icon="👤">
                <InfoRow label="Civilité" value={auxiliaire.civilite} />
                <InfoRow label="Nom" value={auxiliaire.nom} />
                <InfoRow label="Prénom" value={auxiliaire.prenom} />
                <InfoRow label="Nom de naissance" value={auxiliaire.nom_naissance} />
                <InfoRow label="Date de naissance" value={formatDate(auxiliaire.date_naissance)} />
                <InfoRow label="Lieu de naissance" value={auxiliaire.lieu_naissance} />
                <InfoRow label="Nationalité" value={auxiliaire.nationalite} />
              </Section>

              {/* Coordonnées */}
              <Section title="Coordonnées" icon="📍">
                <InfoRow label="Adresse" value={auxiliaire.adresse} />
                <InfoRow label="Code postal" value={auxiliaire.code_postal} />
                <InfoRow label="Ville" value={auxiliaire.ville} />
                <InfoRow 
                  label="Téléphone" 
                  value={auxiliaire.telephone}
                  isLink={!!auxiliaire.telephone}
                  href={`tel:${auxiliaire.telephone}`}
                />
                <InfoRow 
                  label="Email" 
                  value={auxiliaire.email}
                  isLink={!!auxiliaire.email}
                  href={`mailto:${auxiliaire.email}`}
                />
              </Section>

              {/* Identification */}
              <Section title="Identification" icon="🪪">
                <InfoRow label="N° Sécu. Sociale" value={auxiliaire.numero_secu ? '••••••••••••' + auxiliaire.numero_secu.slice(-3) : null} />
                <InfoRow label="N° CESU" value={auxiliaire.numero_cesu} />
                <InfoRow label="Statut" value={<StatusBadge status={auxiliaire.status || 'actif'} />} />
              </Section>
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              
              {/* Tarification */}
              <Section title="Tarification" icon="💰">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Normal</p>
                    <p className="text-xl font-bold text-gray-800">{auxiliaire.taux_horaire || 12} €/h</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-600">🌙 Nuit</p>
                    <p className="text-xl font-bold text-blue-800">{auxiliaire.taux_horaire_nuit || 15} €/h</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-orange-600">☀️ Dimanche</p>
                    <p className="text-xl font-bold text-orange-800">{auxiliaire.taux_horaire_dimanche || 18} €/h</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-red-600">🎉 Férié</p>
                    <p className="text-xl font-bold text-red-800">{auxiliaire.taux_horaire_ferie || 20} €/h</p>
                  </div>
                </div>
              </Section>

              {/* Lieux d'intervention */}
              <Section title="Mobilité & Zones" icon="🚗">
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${auxiliaire.is_motorisee ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {auxiliaire.is_motorisee ? '✓ Motorisée' : '✗ Non motorisée'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">Lieux d'intervention :</p>
                <div className="flex flex-wrap gap-2">
                  {auxiliaire.lieux_intervention?.length > 0 ? (
                    auxiliaire.lieux_intervention.map((lieu, i) => (
                      <span key={i} className="px-3 py-1 bg-[#a5fce8] text-[#5cb8ae] rounded-full text-sm">
                        {lieu}
                      </span>
                    ))
                  ) : auxiliaire.ville ? (
                    <span className="px-3 py-1 bg-[#a5fce8] text-[#5cb8ae] rounded-full text-sm">
                      {auxiliaire.ville}
                    </span>
                  ) : (
                    <span className="text-gray-400">Aucun lieu défini</span>
                  )}
                </div>
              </Section>

              {/* Compétences */}
              <Section title="Compétences" icon="🎓">
                {auxiliaire.competences?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {auxiliaire.competences.map((comp, i) => (
                      <span key={i} className="px-3 py-1 bg-[#74ccc3] bg-opacity-20 text-[#5cb8ae] rounded-full text-sm border border-[#74ccc3]">
                        ✓ {comp}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Aucune compétence renseignée</p>
                )}
                
                {auxiliaire.notes_competences && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Notes :</p>
                    <p className="text-gray-700">{auxiliaire.notes_competences}</p>
                  </div>
                )}
              </Section>

              {/* Formations & Diplômes */}
              {(auxiliaire.formations?.length > 0 || auxiliaire.diplomes?.length > 0) && (
                <Section title="Formations & Diplômes" icon="📚">
                  {auxiliaire.formations?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-2">Formations :</p>
                      <div className="flex flex-wrap gap-2">
                        {auxiliaire.formations.map((f, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {auxiliaire.diplomes?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Diplômes :</p>
                      <div className="flex flex-wrap gap-2">
                        {auxiliaire.diplomes.map((d, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* Qualités */}
              {auxiliaire.qualites?.length > 0 && (
                <Section title="Qualités" icon="⭐">
                  <div className="flex flex-wrap gap-2">
                    {auxiliaire.qualites.map((q, i) => (
                      <span key={i} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">{q}</span>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* Footer RGPD - pleine largeur */}
            {auxiliaire.rgpd_consent && (
              <div className="lg:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">🔒 Consentement RGPD :</span> Recueilli le {formatDate(auxiliaire.rgpd_consent_date) || formatDate(auxiliaire.created_at)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Calendrier */}
        {activeTab === 'calendrier' && (
          <CalendrierModule 
            entityType="auxiliaire" 
            entityId={auxiliaire.id} 
          />
        )}

        {/* Onglet Tâches */}
        {activeTab === 'taches' && (
          <TachesModule 
            entityType="auxiliaire" 
            entityId={auxiliaire.id} 
          />
        )}
      </main>
    </>
  );
}