'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ========== COMPOSANTS EXTERNES (hors du composant principal) ==========

// Composant Section accordéon
const Section = ({ id, title, icon, children, badge, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="flex items-center gap-2 font-medium text-gray-700">
        <span>{icon}</span>
        {title}
        {badge && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-[#74ccc3] text-white rounded-full">
            {badge}
          </span>
        )}
      </span>
      <svg
        className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && (
      <div className="p-4 bg-white">{children}</div>
    )}
  </div>
);

// Composant Info tooltip
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block ml-2">
    <svg className="w-4 h-4 text-gray-400 hover:text-[#74ccc3] cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

// Composant Tag
const TagList = ({ items, field, onRemove, color = 'bg-[#a5fce8]' }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {items.map((item, index) => (
      <span
        key={index}
        className={`inline-flex items-center gap-1 px-3 py-1 ${color} text-gray-700 rounded-full text-sm`}
      >
        {item}
        <button
          type="button"
          onClick={() => onRemove(field, index)}
          className="hover:text-red-600"
        >
          ×
        </button>
      </span>
    ))}
  </div>
);

// ========== COMPOSANT PRINCIPAL ==========

export default function NouveauBeneficiairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Sections accordéon
  const [openSections, setOpenSections] = useState({
    civil: true,
    problematique: true,
    confiance: true,
    administratif: false,
    medical: false,
    apa: false,
    acces: false,
    liens: false,
    coffre: false
  });
  
  const [formData, setFormData] = useState({
    // Photo
    photo_url: '',
    photo_preview: null,
    // État civil
    civilite: 'M.',
    nom: '',
    prenom: '',
    nom_jeune_fille: '',
    date_naissance: '',
    lieu_naissance: '',
    situation_familiale: '',
    // Coordonnées
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    telephone2: '',
    email: '',
    // Problématique & Mode de vie
    problematique_mode_vie: '',
    // Personne de confiance
    personne_confiance_nom: '',
    personne_confiance_telephone: '',
    personne_confiance_email: '',
    personne_confiance_relation: '',
    // Administratif
    numero_securite_sociale: '',
    numero_cesu: '',
    mutuelle: '',
    caisse_retraite: '',
    offre_type: '',
    status: 'actif',
    // Médical
    gir_level: '',
    ald: [],
    pathologies: [],
    allergies: [],
    has_pacemaker: false,
    problematiques_sante: '',
    is_hospitalized: false,
    // APA
    a_apa: false,
    apa_status: '',
    apa_notes: '',
    // Accès domicile
    code_boite_clef: '',
    note_boite_clef: '',
    // Liens & Options
    lien_drive: '',
    lien_drive_clients: '',
    seniorassist_enabled: false,
    // Coffre-fort
    coffre_fort: [],
    coffre_pin: '',
    coffre_pin_confirm: '',
    // RGPD
    rgpd_consent: false,
    rgpd_consent_date: null
  });

  // Champs temporaires pour les listes
  const [newAld, setNewAld] = useState('');
  const [newPathologie, setNewPathologie] = useState('');
  const [newAllergie, setNewAllergie] = useState('');
  
  // Coffre-fort temporaire
  const [newCoffreEntry, setNewCoffreEntry] = useState({
    plateforme: '',
    login: '',
    password: '',
    note: ''
  });
  const [showCoffrePasswords, setShowCoffrePasswords] = useState({});

  // Listes prédéfinies
  const mutuelles = [
    'Harmonie Mutuelle', 'MGEN', 'Aésio Mutuelle', 'Malakoff Humanis',
    'AXA', 'Groupama', 'Macif', 'MAAF', 'Allianz', 'La Mutuelle Générale', 'Autre'
  ];
  
  const caissesRetraite = [
    'CNAV', 'Agirc-Arrco', 'MSA', 'CNRACL', 'SRE',
    'Ircantec', 'RAFP', 'CIPAV', 'SSI', 'CNIEG', 'Autre'
  ];

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestion de la photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image trop volumineuse (max 2 Mo)');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photo_preview: reader.result,
          photo_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo_preview: null,
      photo_url: ''
    }));
  };

  // Fonctions pour les listes
  const addToList = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeFromList = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Coffre-fort functions
  const handleCoffreEntryChange = (e) => {
    const { name, value } = e.target;
    setNewCoffreEntry(prev => ({ ...prev, [name]: value }));
  };

  const addCoffreEntry = () => {
    if (newCoffreEntry.plateforme && newCoffreEntry.login) {
      setFormData(prev => ({
        ...prev,
        coffre_fort: [...prev.coffre_fort, { ...newCoffreEntry, id: Date.now() }]
      }));
      setNewCoffreEntry({ plateforme: '', login: '', password: '', note: '' });
    } else {
      alert('Veuillez renseigner au moins la plateforme et le login');
    }
  };

  const removeCoffreEntry = (id) => {
    setFormData(prev => ({
      ...prev,
      coffre_fort: prev.coffre_fort.filter(entry => entry.id !== id)
    }));
  };

  const togglePasswordVisibility = (id) => {
    setShowCoffrePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.rgpd_consent) {
      alert('Veuillez confirmer le consentement RGPD');
      return;
    }
    
    // Validation PIN coffre-fort
    if (formData.coffre_fort.length > 0) {
      if (!formData.coffre_pin || formData.coffre_pin.length < 4) {
        alert('Veuillez définir un code PIN à 4 chiffres minimum pour sécuriser le coffre-fort');
        return;
      }
      if (formData.coffre_pin !== formData.coffre_pin_confirm) {
        alert('Les codes PIN ne correspondent pas');
        return;
      }
    }
    
    setLoading(true);
    
    const beneficiaires = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    const newBeneficiaire = {
      ...formData,
      id: Date.now().toString(),
      coffre_pin_hash: formData.coffre_pin,
      rgpd_consent_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    delete newBeneficiaire.photo_preview;
    delete newBeneficiaire.coffre_pin;
    delete newBeneficiaire.coffre_pin_confirm;
    
    beneficiaires.push(newBeneficiaire);
    localStorage.setItem('beneficiaires', JSON.stringify(beneficiaires));
    
    setTimeout(() => {
      router.push('/dashboard/beneficiaires');
    }, 500);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nouveau Bénéficiaire</h2>
          <p className="text-sm text-gray-500">Enregistrer un nouveau patient dans le système</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Annuler</span>
        </button>
      </header>

      {/* Formulaire */}
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Photo de profil */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                {formData.photo_preview ? (
                  <div className="relative">
                    <img
                      src={formData.photo_preview}
                      alt="Aperçu"
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#74ccc3]"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formData.photo_preview ? 'Changer la photo' : 'Ajouter une photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG ou WebP • Max 2 Mo</p>
              </div>
            </div>
          </div>

          {/* Section 1: État civil & Coordonnées */}
          <Section id="civil" title="État civil & Coordonnées" icon="👤" isOpen={openSections.civil} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité *</label>
                <select
                  name="civilite"
                  value={formData.civilite}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  required
                >
                  <option value="M.">M.</option>
                  <option value="Mme">Mme</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de jeune fille</label>
                <input
                  type="text"
                  name="nom_jeune_fille"
                  value={formData.nom_jeune_fille}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                <input
                  type="text"
                  name="lieu_naissance"
                  value={formData.lieu_naissance}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situation familiale</label>
                <select
                  name="situation_familiale"
                  value={formData.situation_familiale}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="veuf">Veuf / Veuve</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="pacse">Pacsé(e)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone principal</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="01 23 45 67 89"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone secondaire</label>
                <input
                  type="tel"
                  name="telephone2"
                  value={formData.telephone2}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                <input
                  type="text"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                  maxLength="5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </Section>

          {/* Section 2: Problématique & Mode de vie */}
          <Section id="problematique" title="Problématique & Mode de vie" icon="📝" isOpen={openSections.problematique} onToggle={toggleSection}>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                Description de la situation
                <InfoTooltip text="Décrivez ici : la raison de la prise en charge, les difficultés rencontrées au quotidien, les habitudes de vie (horaires de lever/coucher, repas), les centres d'intérêt, la présence d'animaux, les particularités du domicile, etc." />
              </label>
              <textarea
                name="problematique_mode_vie"
                value={formData.problematique_mode_vie}
                onChange={handleChange}
                rows="5"
                placeholder="Ex: Mme Martin vit seule depuis le décès de son mari en 2020. Elle présente des troubles de la mémoire débutants et des difficultés à la marche suite à une chute en 2023. Elle a un chat nommé Felix. Elle se lève vers 8h et se couche vers 21h. Elle aime regarder les émissions de jardinage..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ces informations aideront les intervenants à mieux comprendre la situation et personnaliser l'accompagnement.
              </p>
            </div>
          </Section>

          {/* Section 3: Personne de confiance */}
          <Section id="confiance" title="Personne de confiance" icon="👨‍👩‍👧" isOpen={openSections.confiance} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="personne_confiance_nom"
                  value={formData.personne_confiance_nom}
                  onChange={handleChange}
                  placeholder="Prénom Nom"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select
                  name="personne_confiance_relation"
                  value={formData.personne_confiance_relation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="enfant">Enfant</option>
                  <option value="conjoint">Conjoint(e)</option>
                  <option value="neveu_niece">Neveu / Nièce</option>
                  <option value="ami">Ami(e)</option>
                  <option value="voisin">Voisin(e)</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="personne_confiance_telephone"
                  value={formData.personne_confiance_telephone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="personne_confiance_email"
                  value={formData.personne_confiance_email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
            </div>
          </Section>

          {/* Section 4: Administratif */}
          <Section id="administratif" title="Administratif" icon="📋" isOpen={openSections.administratif} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Sécurité Sociale
                  <span className="ml-2 text-xs text-orange-600 font-normal">🔒 Donnée sensible</span>
                </label>
                <input
                  type="text"
                  name="numero_securite_sociale"
                  value={formData.numero_securite_sociale}
                  onChange={handleChange}
                  maxLength="15"
                  placeholder="1 85 12 75 108 234 56"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Nécessaire pour les remboursements et l'APA</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° CESU</label>
                <input
                  type="text"
                  name="numero_cesu"
                  value={formData.numero_cesu}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutuelle</label>
                <select
                  name="mutuelle"
                  value={formData.mutuelle}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  {mutuelles.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caisse de retraite</label>
                <select
                  name="caisse_retraite"
                  value={formData.caisse_retraite}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  {caissesRetraite.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offre souscrite</label>
                <select
                  name="offre_type"
                  value={formData.offre_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  <option value="">-- Aucune offre --</option>
                  <option value="coordination">Coordination (600€/mois)</option>
                  <option value="coordination_couple">Coordination Couple (900€/mois)</option>
                  <option value="coordination_plus">Coordination+ (900€/mois)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  <option value="prospect">Prospect</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Section 5: Médical */}
          <Section id="medical" title="Informations médicales" icon="🏥" badge={formData.is_hospitalized ? 'Hospitalisé' : null} isOpen={openSections.medical} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Niveau GIR
                    <span className="ml-2 text-xs text-gray-500 font-normal">(1 = très dépendant, 6 = autonome)</span>
                  </label>
                  <select
                    name="gir_level"
                    value={formData.gir_level}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  >
                    <option value="">-- Non évalué --</option>
                    <option value="1">GIR 1 - Dépendance totale</option>
                    <option value="2">GIR 2 - Dépendance forte</option>
                    <option value="3">GIR 3 - Dépendance moyenne</option>
                    <option value="4">GIR 4 - Dépendance modérée</option>
                    <option value="5">GIR 5 - Dépendance légère</option>
                    <option value="6">GIR 6 - Autonome</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_pacemaker"
                      checked={formData.has_pacemaker}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940]"
                    />
                    <span className="text-gray-700">Porteur de pacemaker</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_hospitalized"
                      checked={formData.is_hospitalized}
                      onChange={handleChange}
                      className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-700">Actuellement hospitalisé</span>
                  </label>
                </div>
              </div>
              
              {/* ALD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Affections Longue Durée (ALD)
                  <span className="ml-2 text-xs text-orange-600 font-normal">🔒 Donnée de santé</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAld}
                    onChange={(e) => setNewAld(e.target.value)}
                    placeholder="Ex: Diabète, Hypertension..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToList('ald', newAld, setNewAld);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList('ald', newAld, setNewAld)}
                    className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]"
                  >
                    +
                  </button>
                </div>
                <TagList items={formData.ald} field="ald" onRemove={removeFromList} color="bg-red-100" />
              </div>
              
              {/* Pathologies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pathologies
                  <span className="ml-2 text-xs text-orange-600 font-normal">🔒 Donnée de santé</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPathologie}
                    onChange={(e) => setNewPathologie(e.target.value)}
                    placeholder="Ex: Alzheimer, Parkinson..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToList('pathologies', newPathologie, setNewPathologie);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList('pathologies', newPathologie, setNewPathologie)}
                    className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]"
                  >
                    +
                  </button>
                </div>
                <TagList items={formData.pathologies} field="pathologies" onRemove={removeFromList} color="bg-orange-100" />
              </div>
              
              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                  <span className="ml-2 text-xs text-orange-600 font-normal">🔒 Donnée de santé</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAllergie}
                    onChange={(e) => setNewAllergie(e.target.value)}
                    placeholder="Ex: Pénicilline, Arachides..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToList('allergies', newAllergie, setNewAllergie);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList('allergies', newAllergie, setNewAllergie)}
                    className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]"
                  >
                    +
                  </button>
                </div>
                <TagList items={formData.allergies} field="allergies" onRemove={removeFromList} color="bg-yellow-100" />
              </div>
              
              {/* Problématiques de santé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes médicales complémentaires</label>
                <textarea
                  name="problematiques_sante"
                  value={formData.problematiques_sante}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Traitements en cours, précautions particulières..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
            </div>
          </Section>

          {/* Section 6: APA */}
          <Section id="apa" title="APA (Allocation Personnalisée d'Autonomie)" icon="💶" isOpen={openSections.apa} onToggle={toggleSection}>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="a_apa"
                  checked={formData.a_apa}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940]"
                />
                <span className="text-gray-700 font-medium">Bénéficiaire de l'APA</span>
              </label>
              
              {formData.a_apa && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8 border-l-2 border-[#74ccc3]">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut du dossier</label>
                    <select
                      name="apa_status"
                      value={formData.apa_status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="demande_en_cours">Demande en cours</option>
                      <option value="evaluation_prevue">Évaluation prévue</option>
                      <option value="accorde">Accordé</option>
                      <option value="renouvellement">En renouvellement</option>
                      <option value="refuse">Refusé</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes APA</label>
                    <textarea
                      name="apa_notes"
                      value={formData.apa_notes}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Montant accordé, heures par semaine, date de fin..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Section 7: Accès domicile */}
          <Section id="acces" title="Accès au domicile" icon="🔑" isOpen={openSections.acces} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code boîte à clef
                  <span className="ml-2 text-xs text-orange-600 font-normal">🔒 Sensible</span>
                </label>
                <input
                  type="text"
                  name="code_boite_clef"
                  value={formData.code_boite_clef}
                  onChange={handleChange}
                  placeholder="Ex: 1234"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent font-mono"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement / Notes</label>
                <input
                  type="text"
                  name="note_boite_clef"
                  value={formData.note_boite_clef}
                  onChange={handleChange}
                  placeholder="Ex: À droite de la porte, derrière le pot de fleurs"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
            </div>
          </Section>

          {/* Section 8: Liens Drive & Options */}
          <Section id="liens" title="Liens Drive & Options" icon="📁" isOpen={openSections.liens} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien Drive Équipe
                    <span className="ml-2 text-xs text-[#74ccc3] font-normal">📁 Accès rapide sur la fiche</span>
                  </label>
                  <input
                    type="url"
                    name="lien_drive"
                    value={formData.lien_drive}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien Drive Clients/Aidants</label>
                  <input
                    type="url"
                    name="lien_drive_clients"
                    value={formData.lien_drive_clients}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="seniorassist_enabled"
                  checked={formData.seniorassist_enabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940]"
                />
                <span className="text-gray-700">Activer SeniorAssist (surveillance)</span>
              </label>
              
              {/* Avertissement HDS */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-amber-800">
                  <strong>Important :</strong> Pour le stockage de documents contenant des données de santé, 
                  il est fortement recommandé d'utiliser un service de stockage <strong>certifié HDS</strong>. 
                  <span className="block mt-1 text-amber-700">
                    Care-Pilot ne peut être tenu responsable des données stockées sur des services tiers non certifiés.
                  </span>
                </div>
              </div>
            </div>
          </Section>

          {/* Section 9: Coffre-fort */}
          <Section id="coffre" title="Coffre-fort numérique" icon="🔐" badge={formData.coffre_fort.length > 0 ? `${formData.coffre_fort.length} entrée(s)` : null} isOpen={openSections.coffre} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-600">
                  Stockez ici les identifiants de connexion aux services du bénéficiaire (banque, mutuelle, impôts, etc.). 
                  Ces données sont protégées par un code PIN que vous définirez. 
                  <strong className="text-gray-700"> Seuls les administrateurs peuvent récupérer le PIN en cas d'oubli.</strong>
                </div>
              </div>

              {/* Formulaire d'ajout d'entrée */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <h4 className="font-medium text-gray-700 mb-3">Ajouter un accès</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Plateforme / Service *</label>
                    <input
                      type="text"
                      name="plateforme"
                      value={newCoffreEntry.plateforme}
                      onChange={handleCoffreEntryChange}
                      placeholder="Ex: Améli, Impôts, EDF..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Identifiant / Login *</label>
                    <input
                      type="text"
                      name="login"
                      value={newCoffreEntry.login}
                      onChange={handleCoffreEntryChange}
                      placeholder="Ex: email ou numéro de compte"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
                    <input
                      type="password"
                      name="password"
                      value={newCoffreEntry.password}
                      onChange={handleCoffreEntryChange}
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
                    <input
                      type="text"
                      name="note"
                      value={newCoffreEntry.note}
                      onChange={handleCoffreEntryChange}
                      placeholder="Ex: Question secrète, etc."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addCoffreEntry}
                  className="mt-3 px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae] text-sm font-medium transition-colors"
                >
                  + Ajouter cet accès
                </button>
              </div>

              {/* Liste des entrées */}
              {formData.coffre_fort.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Accès enregistrés</h4>
                  {formData.coffre_fort.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-gray-500">Plateforme</span>
                          <p className="font-medium">{entry.plateforme}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Login</span>
                          <p className="font-mono text-gray-700">{entry.login}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Mot de passe</span>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-gray-700">
                              {showCoffrePasswords[entry.id] ? entry.password : '••••••••'}
                            </p>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(entry.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {showCoffrePasswords[entry.id] ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                )}
                              </svg>
                            </button>
                          </div>
                        </div>
                        {entry.note && (
                          <div>
                            <span className="text-xs text-gray-500">Note</span>
                            <p className="text-gray-600">{entry.note}</p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCoffreEntry(entry.id)}
                        className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Code PIN */}
              {formData.coffre_fort.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#d85940]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Définir le code PIN de protection *
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code PIN (4 chiffres min.)</label>
                      <input
                        type="password"
                        name="coffre_pin"
                        value={formData.coffre_pin}
                        onChange={handleChange}
                        maxLength="6"
                        placeholder="••••"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent font-mono text-center text-xl tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le PIN</label>
                      <input
                        type="password"
                        name="coffre_pin_confirm"
                        value={formData.coffre_pin_confirm}
                        onChange={handleChange}
                        maxLength="6"
                        placeholder="••••"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent font-mono text-center text-xl tracking-widest"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Ce code sera demandé pour accéder aux identifiants sur la fiche du bénéficiaire.
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Consentement RGPD */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="rgpd_consent"
                checked={formData.rgpd_consent}
                onChange={handleChange}
                className="mt-1 w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940]"
                required
              />
              <span className="text-sm text-gray-700">
                J'ai informé ce bénéficiaire (ou son représentant légal) que ses données personnelles 
                et de santé sont collectées pour la gestion de sa prise en charge au sein de notre structure. 
                Ces données seront conservées pendant la durée de l'accompagnement et 
                <strong> 2 ans après la fin de la prise en charge</strong> (obligation légale). 
                Il dispose d'un droit d'accès, de rectification et de suppression 
                en contactant <a href="mailto:rgpd@care-pilot.fr" className="text-[#d85940] underline">rgpd@care-pilot.fr</a>.
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#d85940] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#c04330] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enregistrer le bénéficiaire
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </>
  );
}