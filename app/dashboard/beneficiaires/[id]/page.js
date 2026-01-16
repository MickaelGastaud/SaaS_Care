'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CalendrierModule from '@/components/modules/CalendrierModule';
import TachesModule from '@/components/modules/TachesModule';
import ContactsModule from '@/components/modules/ContactsModule';

// ==================== COMPOSANTS UI ====================

const StatusBadge = ({ status }) => {
  const config = {
    actif: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
    inactif: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactif' },
    prospect: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Prospect' },
    hospitalisé: { bg: 'bg-red-100', text: 'text-red-700', label: 'Hospitalisé' }
  };
  const style = config[status] || config.actif;
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

const Tab = ({ label, icon, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
      active 
        ? 'bg-[#74ccc3] text-white' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <span>{icon}</span>
    {label}
    {badge > 0 && (
      <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${active ? 'bg-white text-[#74ccc3]' : 'bg-[#d85940] text-white'}`}>
        {badge}
      </span>
    )}
  </button>
);

const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-800">
          <span>{icon}</span>{title}
        </span>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

const InfoRow = ({ label, value, isLink = false, href = '', isMono = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 sm:w-44 flex-shrink-0">{label}</span>
    {isLink && value ? (
      <a href={href} className="text-[#d85940] hover:underline">{value}</a>
    ) : (
      <span className={`text-gray-800 ${isMono ? 'font-mono' : ''}`}>
        {value || <span className="text-gray-400">-</span>}
      </span>
    )}
  </div>
);

// ==================== COMPOSANT PRINCIPAL ====================
export default function FicheBeneficiairePage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState('infos');
  const [beneficiaire, setBeneficiaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasksCount, setTasksCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadBeneficiaire();
      loadTasksCount();
    }
  }, [params.id]);

  const loadBeneficiaire = () => {
    const beneficiaires = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    const found = beneficiaires.find(b => b.id === params.id);
    setBeneficiaire(found || null);
    setLoading(false);
  };

  const loadTasksCount = () => {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const count = tasks.filter(t => 
      t.entity_type === 'beneficiaire' && 
      t.entity_id === params.id && 
      t.status !== 'terminee'
    ).length;
    setTasksCount(count);
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return null;
    const today = new Date();
    const birth = new Date(dateNaissance);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[#d85940] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!beneficiaire) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="text-5xl mb-4">😕</span>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Bénéficiaire non trouvé</h2>
        <p className="text-gray-500 mb-4">Ce bénéficiaire n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => router.push('/dashboard/beneficiaires')}
          className="text-[#d85940] hover:underline"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const age = calculateAge(beneficiaire.date_naissance);
  const displayStatus = beneficiaire.is_hospitalized ? 'hospitalisé' : (beneficiaire.status || 'actif');

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {beneficiaire.photo_url ? (
              <img 
                src={beneficiaire.photo_url} 
                alt="" 
                className="w-16 h-16 rounded-full object-cover border-4 border-[#74ccc3]" 
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${getAvatarColor(beneficiaire.prenom, beneficiaire.nom)} text-white flex items-center justify-center font-bold text-xl`}>
                {beneficiaire.prenom?.[0]}{beneficiaire.nom?.[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {beneficiaire.civilite} {beneficiaire.prenom} {beneficiaire.nom}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={displayStatus} />
                {beneficiaire.gir_level && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">GIR {beneficiaire.gir_level}</span>
                )}
                {beneficiaire.seniorassist_enabled && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">📡 SeniorAssist</span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {age && `${age} ans`}
                {beneficiaire.ville && ` • ${beneficiaire.ville}`}
                {beneficiaire.offre_type && ` • ${beneficiaire.offre_type.replace(/_/g, ' ')}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/beneficiaires/${beneficiaire.id}/edit`)}
              className="px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>
            <button
              onClick={() => router.push('/dashboard/beneficiaires')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Alerte hospitalisation */}
        {beneficiaire.is_hospitalized && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <span className="text-red-500 text-xl">🏥</span>
            <span className="text-red-800 font-medium">Ce bénéficiaire est actuellement hospitalisé</span>
          </div>
        )}

        {/* Boutons d'actions rapides */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          {beneficiaire.telephone && (
            <a
              href={`tel:${beneficiaire.telephone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Appeler
            </a>
          )}
          
          {beneficiaire.lien_drive && (
            <a
              href={beneficiaire.lien_drive}
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

          {beneficiaire.email && (
            <a
              href={`mailto:${beneficiaire.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}

          {beneficiaire.personne_confiance_telephone && (
            <a
              href={`tel:${beneficiaire.personne_confiance_telephone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pers. confiance
            </a>
          )}

          {beneficiaire.code_boite_clef && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Code : <span className="font-mono font-bold text-[#d85940]">{beneficiaire.code_boite_clef}</span>
            </span>
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
            badge={tasksCount}
          />
          <Tab 
            label="Contacts" 
            icon="👥" 
            active={activeTab === 'contacts'} 
            onClick={() => setActiveTab('contacts')} 
          />
          {beneficiaire.coffre_fort?.length > 0 && (
            <Tab 
              label="Coffre-fort" 
              icon="🔐" 
              active={activeTab === 'coffre'} 
              onClick={() => setActiveTab('coffre')} 
            />
          )}
        </div>
      </header>

      {/* Contenu */}
      <main className="p-6">
        
        {/* Onglet Informations */}
        {activeTab === 'infos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Colonne gauche */}
            <div className="space-y-6">
              
              {/* Problématique & Mode de vie */}
              {beneficiaire.problematique_mode_vie && (
                <Section title="Problématique & Mode de vie" icon="📝">
                  <p className="text-gray-700 whitespace-pre-wrap">{beneficiaire.problematique_mode_vie}</p>
                </Section>
              )}
              
              {/* État civil */}
              <Section title="État civil" icon="👤">
                <InfoRow label="Civilité" value={beneficiaire.civilite} />
                <InfoRow label="Nom" value={beneficiaire.nom} />
                <InfoRow label="Prénom" value={beneficiaire.prenom} />
                <InfoRow label="Nom de jeune fille" value={beneficiaire.nom_jeune_fille} />
                <InfoRow label="Date de naissance" value={formatDate(beneficiaire.date_naissance)} />
                <InfoRow label="Lieu de naissance" value={beneficiaire.lieu_naissance} />
                <InfoRow label="Situation familiale" value={beneficiaire.situation_familiale} />
              </Section>

              {/* Coordonnées */}
              <Section title="Coordonnées" icon="📍">
                <InfoRow label="Adresse" value={beneficiaire.adresse} />
                <InfoRow label="Code postal" value={beneficiaire.code_postal} />
                <InfoRow label="Ville" value={beneficiaire.ville} />
                <InfoRow 
                  label="Téléphone" 
                  value={beneficiaire.telephone}
                  isLink={!!beneficiaire.telephone}
                  href={`tel:${beneficiaire.telephone}`}
                />
                {beneficiaire.telephone2 && (
                  <InfoRow 
                    label="Téléphone 2" 
                    value={beneficiaire.telephone2}
                    isLink={true}
                    href={`tel:${beneficiaire.telephone2}`}
                  />
                )}
                <InfoRow 
                  label="Email" 
                  value={beneficiaire.email}
                  isLink={!!beneficiaire.email}
                  href={`mailto:${beneficiaire.email}`}
                />
              </Section>

              {/* Personne de confiance */}
              {beneficiaire.personne_confiance_nom && (
                <Section title="Personne de confiance" icon="👨‍👩‍👧">
                  <InfoRow label="Nom" value={beneficiaire.personne_confiance_nom} />
                  <InfoRow label="Relation" value={beneficiaire.personne_confiance_relation} />
                  <InfoRow 
                    label="Téléphone" 
                    value={beneficiaire.personne_confiance_telephone}
                    isLink={!!beneficiaire.personne_confiance_telephone}
                    href={`tel:${beneficiaire.personne_confiance_telephone}`}
                  />
                  <InfoRow 
                    label="Email" 
                    value={beneficiaire.personne_confiance_email}
                    isLink={!!beneficiaire.personne_confiance_email}
                    href={`mailto:${beneficiaire.personne_confiance_email}`}
                  />
                </Section>
              )}
            </div>

            {/* Colonne droite */}
            <div className="space-y-6">
              
              {/* Informations médicales */}
              <Section title="Informations médicales" icon="🏥">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-purple-600">Niveau GIR</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {beneficiaire.gir_level || '-'}
                      </p>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${beneficiaire.has_pacemaker ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <p className="text-sm text-gray-600">Pacemaker</p>
                      <p className={`text-lg font-bold ${beneficiaire.has_pacemaker ? 'text-red-700' : 'text-gray-500'}`}>
                        {beneficiaire.has_pacemaker ? '⚠️ Oui' : 'Non'}
                      </p>
                    </div>
                  </div>
                  
                  {beneficiaire.ald?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Affections Longue Durée (ALD)</p>
                      <div className="flex flex-wrap gap-2">
                        {beneficiaire.ald.map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {beneficiaire.pathologies?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Pathologies</p>
                      <div className="flex flex-wrap gap-2">
                        {beneficiaire.pathologies.map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {beneficiaire.allergies?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {beneficiaire.allergies.map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">⚠️ {item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {beneficiaire.problematiques_sante && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Notes médicales</p>
                      <p className="text-gray-700">{beneficiaire.problematiques_sante}</p>
                    </div>
                  )}
                </div>
              </Section>

              {/* APA */}
              {beneficiaire.a_apa && (
                <Section title="APA (Allocation Personnalisée d'Autonomie)" icon="💶">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      beneficiaire.apa_status === 'accordee' ? 'bg-green-100 text-green-700' :
                      beneficiaire.apa_status === 'en_cours' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {beneficiaire.apa_status === 'accordee' ? '✓ Accordée' :
                       beneficiaire.apa_status === 'en_cours' ? '⏳ En cours' :
                       beneficiaire.apa_status?.replace(/_/g, ' ') || 'Non renseigné'}
                    </span>
                  </div>
                  {beneficiaire.apa_notes && (
                    <p className="text-gray-700">{beneficiaire.apa_notes}</p>
                  )}
                </Section>
              )}

              {/* Accès domicile */}
              {(beneficiaire.code_boite_clef || beneficiaire.note_boite_clef) && (
                <Section title="Accès au domicile" icon="🔑">
                  {beneficiaire.code_boite_clef && (
                    <div className="bg-[#a5fce8] rounded-lg p-4 text-center mb-3">
                      <p className="text-sm text-[#5cb8ae] mb-1">Code boîte à clef</p>
                      <p className="text-3xl font-mono font-bold text-[#d85940]">{beneficiaire.code_boite_clef}</p>
                    </div>
                  )}
                  {beneficiaire.note_boite_clef && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Emplacement / Notes</p>
                      <p className="text-gray-700">{beneficiaire.note_boite_clef}</p>
                    </div>
                  )}
                </Section>
              )}

              {/* Administratif */}
              <Section title="Administratif" icon="📋" defaultOpen={false}>
                <InfoRow label="N° Sécurité Sociale" value={beneficiaire.numero_securite_sociale} isMono />
                <InfoRow label="N° CESU" value={beneficiaire.numero_cesu} isMono />
                <InfoRow label="Mutuelle" value={beneficiaire.mutuelle} />
                <InfoRow label="Caisse de retraite" value={beneficiaire.caisse_retraite} />
                <InfoRow label="Offre souscrite" value={beneficiaire.offre_type?.replace(/_/g, ' ')} />
              </Section>

              {/* Documents */}
              {(beneficiaire.lien_drive || beneficiaire.lien_drive_clients) && (
                <Section title="Documents" icon="📁" defaultOpen={false}>
                  {beneficiaire.lien_drive && (
                    <a 
                      href={beneficiaire.lien_drive} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-2"
                    >
                      <svg className="w-5 h-5 text-[#d85940]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-[#d85940]">Drive Équipe</span>
                      <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {beneficiaire.lien_drive_clients && (
                    <a 
                      href={beneficiaire.lien_drive_clients} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 text-[#74ccc3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-[#74ccc3]">Drive Famille / Aidants</span>
                      <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </Section>
              )}
            </div>

            {/* Footer RGPD - pleine largeur */}
            {beneficiaire.rgpd_consent && (
              <div className="lg:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">🔒 Consentement RGPD :</span> Recueilli le {formatDate(beneficiaire.rgpd_consent_date) || formatDate(beneficiaire.created_at)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Calendrier */}
        {activeTab === 'calendrier' && (
          <CalendrierModule 
            entityType="beneficiaire" 
            entityId={beneficiaire.id} 
          />
        )}

        {/* Onglet Tâches */}
        {activeTab === 'taches' && (
          <TachesModule 
            entityType="beneficiaire" 
            entityId={beneficiaire.id}
            onTasksChange={loadTasksCount}
          />
        )}

        {/* Onglet Contacts */}
        {activeTab === 'contacts' && (
          <ContactsModule 
            entityType="beneficiaire" 
            entityId={beneficiaire.id} 
          />
        )}

        {/* Onglet Coffre-fort */}
        {activeTab === 'coffre' && beneficiaire.coffre_fort?.length > 0 && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-amber-500 text-xl">🔐</span>
              <div>
                <p className="font-medium text-amber-800">Zone sécurisée</p>
                <p className="text-sm text-amber-700">Les accès ci-dessous sont protégés. Le code PIN est requis pour voir les mots de passe.</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Plateforme</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Login</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mot de passe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {beneficiaire.coffre_fort.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{entry.plateforme}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">{entry.login}</td>
                      <td className="px-4 py-3 font-mono text-gray-500">••••••••</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">{entry.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}