'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ========== COMPOSANTS EXTERNES (hors du composant principal) ==========

// Composant Section accordéon
const Section = ({ id, title, icon, children, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="flex items-center gap-2 font-medium text-gray-700">
        <span>{icon}</span>
        {title}
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

// Composant Tag pour les listes
const TagList = ({ items, field, onRemove }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {items.map((item, index) => (
      <span
        key={index}
        className="inline-flex items-center gap-1 px-3 py-1 bg-[#a5fce8] text-gray-700 rounded-full text-sm"
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

// Liste des compétences prédéfinies
const COMPETENCES_LIST = [
  'Entretien de l\'environnement',
  'Toilette',
  'Aide au change',
  'Transferts',
  'Courses',
  'Week-end',
  'Nuit',
  'Accompagnement aux RDV',
  'Sorties',
  'Voiture',
  'Préparation repas',
  'Autonomie gestion de planning'
];

// ========== COMPOSANT PRINCIPAL ==========

export default function NouvelAVSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Sections accordéon (pour mobile)
  const [openSections, setOpenSections] = useState({
    civil: true,
    identification: true,
    mobilite: true,
    competences: false,
    tarification: false
  });
  
  const [formData, setFormData] = useState({
    // Photo
    photo_url: '',
    photo_preview: null,
    // État civil
    civilite: 'Mme',
    nom: '',
    prenom: '',
    nom_naissance: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Française',
    // Coordonnées
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: '',
    // Identification
    numero_secu: '',
    numero_cesu: '',
    // Mobilité
    is_motorisee: false,
    lieux_intervention: [],
    // Compétences (maintenant un tableau de compétences cochées)
    competences: [],
    notes_competences: '',
    formations: [],
    diplomes: [],
    qualites: [],
    // Tarification
    taux_horaire: 12.0,
    taux_horaire_nuit: 15.0,
    taux_horaire_dimanche: 18.0,
    taux_horaire_ferie: 20.0,
    // Liens
    lien_drive: '',
    lien_drive_clients: '',
    // Statut
    status: 'actif',
    // RGPD
    rgpd_consent: false,
    rgpd_consent_date: null
  });

  // Champs temporaires pour les listes
  const [newLieu, setNewLieu] = useState('');
  const [newFormation, setNewFormation] = useState('');
  const [newDiplome, setNewDiplome] = useState('');
  const [newQualite, setNewQualite] = useState('');

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

  // Gestion des compétences (cases à cocher)
  const handleCompetenceChange = (competence) => {
    setFormData(prev => {
      const currentCompetences = prev.competences || [];
      if (currentCompetences.includes(competence)) {
        // Retirer la compétence
        return {
          ...prev,
          competences: currentCompetences.filter(c => c !== competence)
        };
      } else {
        // Ajouter la compétence
        return {
          ...prev,
          competences: [...currentCompetences, competence]
        };
      }
    });
  };

  // Gestion de la photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type et la taille
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        alert('Image trop volumineuse (max 2 Mo)');
        return;
      }
      
      // Créer un aperçu
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

  // Fonctions pour ajouter des éléments aux listes
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.rgpd_consent) {
      alert('Veuillez confirmer le consentement RGPD');
      return;
    }
    
    setLoading(true);
    
    // Sauvegarde localStorage
    const auxiliaires = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    const newAVS = {
      ...formData,
      id: Date.now().toString(),
      rgpd_consent_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    // Supprimer photo_preview avant sauvegarde (inutile)
    delete newAVS.photo_preview;
    
    auxiliaires.push(newAVS);
    localStorage.setItem('auxiliaires', JSON.stringify(auxiliaires));
    
    setTimeout(() => {
      router.push('/dashboard/auxiliaires');
    }, 500);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nouvel Auxiliaire de Vie</h2>
          <p className="text-sm text-gray-500">Enregistrer un nouvel AVS dans le système</p>
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
              {/* Aperçu photo */}
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
              
              {/* Bouton upload */}
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

          {/* Section 1: État civil + Coordonnées */}
          <Section id="civil" title="État civil & Coordonnées" icon="👤" isOpen={openSections.civil} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Civilité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité *</label>
                <select
                  name="civilite"
                  value={formData.civilite}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  required
                >
                  <option value="Mme">Mme</option>
                  <option value="M.">M.</option>
                </select>
              </div>
              
              {/* Nom */}
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
              
              {/* Prénom */}
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
              
              {/* Nom de naissance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de naissance</label>
                <input
                  type="text"
                  name="nom_naissance"
                  value={formData.nom_naissance}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Date de naissance */}
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
              
              {/* Lieu de naissance */}
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
              
              {/* Nationalité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <input
                  type="text"
                  name="nationalite"
                  value={formData.nationalite}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Adresse - pleine largeur */}
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
              
              {/* Code postal */}
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
              
              {/* Ville */}
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

          {/* Section 2: Identification */}
          <Section id="identification" title="Identification" icon="🪪" isOpen={openSections.identification} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* N° Sécurité sociale avec avertissement RGPD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Sécurité Sociale
                  <span className="ml-2 text-xs text-orange-600 font-normal">🔒 Donnée sensible</span>
                </label>
                <input
                  type="text"
                  name="numero_secu"
                  value={formData.numero_secu}
                  onChange={handleChange}
                  maxLength="15"
                  placeholder="1 85 12 75 108 234 56"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Collecté uniquement pour les déclarations CESU/URSSAF
                </p>
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
                  <option value="blackliste">Blacklisté</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Section 3: Mobilité */}
          <Section id="mobilite" title="Mobilité & Zones d'intervention" icon="🚗" isOpen={openSections.mobilite} onToggle={toggleSection}>
            <div className="space-y-4">
              {/* Motorisée */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_motorisee"
                  checked={formData.is_motorisee}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940]"
                />
                <span className="text-gray-700">AVS motorisée (possède un véhicule)</span>
              </label>
              
              {/* Lieux d'intervention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieux d'intervention</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLieu}
                    onChange={(e) => setNewLieu(e.target.value)}
                    placeholder="Ex: Paris, Boulogne..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToList('lieux_intervention', newLieu, setNewLieu);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList('lieux_intervention', newLieu, setNewLieu)}
                    className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae] transition-colors"
                  >
                    +
                  </button>
                </div>
                <TagList items={formData.lieux_intervention} field="lieux_intervention" onRemove={removeFromList} />
              </div>
            </div>
          </Section>

          {/* Section 4: Compétences & Formations */}
          <Section id="competences" title="Compétences & Formations" icon="🎓" isOpen={openSections.competences} onToggle={toggleSection}>
            <div className="space-y-6">
              
              {/* Compétences - Cases à cocher */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-[#d85940]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Compétences
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMPETENCES_LIST.map((competence) => (
                    <label
                      key={competence}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.competences.includes(competence)}
                        onChange={() => handleCompetenceChange(competence)}
                        className="w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940] border-gray-300"
                      />
                      <span className="text-gray-700">{competence}</span>
                    </label>
                  ))}
                </div>
                {formData.competences.length > 0 && (
                  <p className="text-sm text-[#74ccc3] mt-2">
                    ✓ {formData.competences.length} compétence(s) sélectionnée(s)
                  </p>
                )}
              </div>
              
              {/* Notes compétences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes sur les compétences</label>
                <textarea
                  name="notes_competences"
                  value={formData.notes_competences}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Précisions supplémentaires sur les compétences..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Formations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formations</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFormation}
                    onChange={(e) => setNewFormation(e.target.value)}
                    placeholder="Ex: DEAES, Formation Alzheimer..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToList('formations', newFormation, setNewFormation);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList('formations', newFormation, setNewFormation)}
                    className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]"
                  >
                    +
                  </button>
                </div>
                <TagList items={formData.formations} field="formations" onRemove={removeFromList} />
              </div>
              
              {/* Diplômes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diplômes</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDiplome}
                    onChange={(e) => setNewDiplome(e.target.value)}
                    placeholder="Ex: CAP, BEP..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToList('diplomes', newDiplome, setNewDiplome);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList('diplomes', newDiplome, setNewDiplome)}
                    className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]"
                  >
                    +
                  </button>
                </div>
                <TagList items={formData.diplomes} field="diplomes" onRemove={removeFromList} />
              </div>
              
              {/* Qualités */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualités</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQualite}
                    onChange={(e) => setNewQualite(e.target.value)}
                    placeholder="Ex: Ponctuelle, Patiente..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToList('qualites', newQualite, setNewQualite);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addToList('qualites', newQualite, setNewQualite)}
                    className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]"
                  >
                    +
                  </button>
                </div>
                <TagList items={formData.qualites} field="qualites" onRemove={removeFromList} />
              </div>
            </div>
          </Section>

          {/* Section 5: Tarification & Liens */}
          <Section id="tarification" title="Tarification & Liens Drive" icon="💰" isOpen={openSections.tarification} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux horaire (€)</label>
                  <input
                    type="number"
                    name="taux_horaire"
                    value={formData.taux_horaire}
                    onChange={handleChange}
                    step="0.5"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux nuit (€)</label>
                  <input
                    type="number"
                    name="taux_horaire_nuit"
                    value={formData.taux_horaire_nuit}
                    onChange={handleChange}
                    step="0.5"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux dimanche (€)</label>
                  <input
                    type="number"
                    name="taux_horaire_dimanche"
                    value={formData.taux_horaire_dimanche}
                    onChange={handleChange}
                    step="0.5"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux férié (€)</label>
                  <input
                    type="number"
                    name="taux_horaire_ferie"
                    value={formData.taux_horaire_ferie}
                    onChange={handleChange}
                    step="0.5"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
              </div>
              
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien Drive Clients</label>
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
              
              {/* Avertissement HDS */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-amber-800">
                  <strong>Important :</strong> Pour le stockage de documents contenant des données de santé, 
                  il est fortement recommandé d'utiliser un service de stockage <strong>certifié HDS</strong> (Hébergeur de Données de Santé). 
                  <span className="block mt-1 text-amber-700">
                    Care-Pilot ne peut être tenu responsable des données stockées sur des services tiers non certifiés.
                  </span>
                </div>
              </div>
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
                J'ai informé cette personne que ses données personnelles sont collectées 
                pour la gestion de son activité professionnelle au sein de notre structure. 
                Ces données seront conservées pendant la durée de la collaboration et 
                <strong> 2 ans après la fin d'activité</strong> (obligation légale). 
                Elle dispose d'un droit d'accès, de rectification et de suppression 
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
                  Enregistrer l'AVS
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