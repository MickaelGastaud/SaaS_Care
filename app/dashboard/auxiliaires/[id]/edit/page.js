'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// ========== COMPOSANTS EXTERNES ==========

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

export default function EditAuxiliairePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    civil: true,
    identification: true,
    mobilite: true,
    competences: true,
    tarification: true
  });
  
  const [formData, setFormData] = useState({
    photo_url: '',
    photo_preview: null,
    civilite: 'Mme',
    nom: '',
    prenom: '',
    nom_naissance: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: 'Française',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    email: '',
    numero_secu: '',
    numero_cesu: '',
    is_motorisee: false,
    lieux_intervention: [],
    competences: [],
    notes_competences: '',
    formations: [],
    diplomes: [],
    qualites: [],
    taux_horaire: 12.0,
    taux_horaire_nuit: 15.0,
    taux_horaire_dimanche: 18.0,
    taux_horaire_ferie: 20.0,
    lien_drive: '',
    lien_drive_clients: '',
    status: 'actif',
    rgpd_consent: false,
    rgpd_consent_date: null
  });

  const [newLieu, setNewLieu] = useState('');
  const [newFormation, setNewFormation] = useState('');
  const [newDiplome, setNewDiplome] = useState('');
  const [newQualite, setNewQualite] = useState('');

  // Charger les données existantes
  useEffect(() => {
    if (params.id) {
      const auxiliaires = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
      const found = auxiliaires.find(a => a.id === params.id);
      if (found) {
        setFormData({
          ...found,
          photo_preview: found.photo_url || null,
          competences: found.competences || [],
          lieux_intervention: found.lieux_intervention || [],
          formations: found.formations || [],
          diplomes: found.diplomes || [],
          qualites: found.qualites || []
        });
      }
      setLoading(false);
    }
  }, [params.id]);

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

  const handleCompetenceChange = (competence) => {
    setFormData(prev => {
      const currentCompetences = prev.competences || [];
      if (currentCompetences.includes(competence)) {
        return { ...prev, competences: currentCompetences.filter(c => c !== competence) };
      } else {
        return { ...prev, competences: [...currentCompetences, competence] };
      }
    });
  };

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
    setFormData(prev => ({ ...prev, photo_preview: null, photo_url: '' }));
  };

  const addToList = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setter('');
    }
  };

  const removeFromList = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    const auxiliaires = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    const index = auxiliaires.findIndex(a => a.id === params.id);
    
    if (index !== -1) {
      const updatedAux = {
        ...formData,
        id: params.id,
        updated_at: new Date().toISOString()
      };
      delete updatedAux.photo_preview;
      
      auxiliaires[index] = updatedAux;
      localStorage.setItem('auxiliaires', JSON.stringify(auxiliaires));
      
      setTimeout(() => {
        router.push(`/dashboard/auxiliaires/${params.id}`);
      }, 500);
    } else {
      setSaving(false);
      alert('Erreur: Auxiliaire non trouvé');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-[#d85940] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Modifier l'Auxiliaire</h2>
          <p className="text-sm text-gray-500">{formData.civilite} {formData.prenom} {formData.nom}</p>
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
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG ou WebP • Max 2 Mo</p>
              </div>
            </div>
          </div>

          {/* Section État civil & Coordonnées */}
          <Section id="civil" title="État civil & Coordonnées" icon="👤" isOpen={openSections.civil} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité *</label>
                <select name="civilite" value={formData.civilite} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" required>
                  <option value="Mme">Mme</option>
                  <option value="M.">M.</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de naissance</label>
                <input type="text" name="nom_naissance" value={formData.nom_naissance} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                <input type="text" name="lieu_naissance" value={formData.lieu_naissance} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <input type="text" name="nationalite" value={formData.nationalite} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="06 12 34 56 78" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange} maxLength="5" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" required />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" required />
              </div>
            </div>
          </Section>

          {/* Section Identification */}
          <Section id="identification" title="Identification" icon="🪪" isOpen={openSections.identification} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Sécurité Sociale
                  <span className="ml-2 text-xs text-orange-600 font-normal">🔒 Donnée sensible</span>
                </label>
                <input type="text" name="numero_secu" value={formData.numero_secu} onChange={handleChange} maxLength="15" placeholder="1 85 12 75 108 234 56" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° CESU</label>
                <input type="text" name="numero_cesu" value={formData.numero_cesu} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent">
                  <option value="prospect">Prospect</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="blackliste">Blacklisté</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Section Mobilité */}
          <Section id="mobilite" title="Mobilité & Zones d'intervention" icon="🚗" isOpen={openSections.mobilite} onToggle={toggleSection}>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_motorisee" checked={formData.is_motorisee} onChange={handleChange} className="w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940]" />
                <span className="text-gray-700">AVS motorisée (possède un véhicule)</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieux d'intervention</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLieu}
                    onChange={(e) => setNewLieu(e.target.value)}
                    placeholder="Ex: Paris, Boulogne..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('lieux_intervention', newLieu, setNewLieu); } }}
                  />
                  <button type="button" onClick={() => addToList('lieux_intervention', newLieu, setNewLieu)} className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae] transition-colors">+</button>
                </div>
                <TagList items={formData.lieux_intervention} field="lieux_intervention" onRemove={removeFromList} />
              </div>
            </div>
          </Section>

          {/* Section Compétences */}
          <Section id="competences" title="Compétences & Formations" icon="🎓" isOpen={openSections.competences} onToggle={toggleSection}>
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <svg className="w-5 h-5 text-[#d85940]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Compétences
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMPETENCES_LIST.map((competence) => (
                    <label key={competence} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={formData.competences.includes(competence)} onChange={() => handleCompetenceChange(competence)} className="w-5 h-5 text-[#d85940] rounded focus:ring-[#d85940] border-gray-300" />
                      <span className="text-gray-700">{competence}</span>
                    </label>
                  ))}
                </div>
                {formData.competences.length > 0 && (
                  <p className="text-sm text-[#74ccc3] mt-2">✓ {formData.competences.length} compétence(s) sélectionnée(s)</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes sur les compétences</label>
                <textarea name="notes_competences" value={formData.notes_competences} onChange={handleChange} rows="2" placeholder="Précisions supplémentaires..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formations</label>
                <div className="flex gap-2">
                  <input type="text" value={newFormation} onChange={(e) => setNewFormation(e.target.value)} placeholder="Ex: DEAES, Formation Alzheimer..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('formations', newFormation, setNewFormation); } }} />
                  <button type="button" onClick={() => addToList('formations', newFormation, setNewFormation)} className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]">+</button>
                </div>
                <TagList items={formData.formations} field="formations" onRemove={removeFromList} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diplômes</label>
                <div className="flex gap-2">
                  <input type="text" value={newDiplome} onChange={(e) => setNewDiplome(e.target.value)} placeholder="Ex: CAP, BEP..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('diplomes', newDiplome, setNewDiplome); } }} />
                  <button type="button" onClick={() => addToList('diplomes', newDiplome, setNewDiplome)} className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]">+</button>
                </div>
                <TagList items={formData.diplomes} field="diplomes" onRemove={removeFromList} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualités</label>
                <div className="flex gap-2">
                  <input type="text" value={newQualite} onChange={(e) => setNewQualite(e.target.value)} placeholder="Ex: Ponctuelle, Patiente..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('qualites', newQualite, setNewQualite); } }} />
                  <button type="button" onClick={() => addToList('qualites', newQualite, setNewQualite)} className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]">+</button>
                </div>
                <TagList items={formData.qualites} field="qualites" onRemove={removeFromList} />
              </div>
            </div>
          </Section>

          {/* Section Tarification */}
          <Section id="tarification" title="Tarification & Liens Drive" icon="💰" isOpen={openSections.tarification} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux horaire (€)</label>
                  <input type="number" name="taux_horaire" value={formData.taux_horaire} onChange={handleChange} step="0.5" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux nuit (€)</label>
                  <input type="number" name="taux_horaire_nuit" value={formData.taux_horaire_nuit} onChange={handleChange} step="0.5" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux dimanche (€)</label>
                  <input type="number" name="taux_horaire_dimanche" value={formData.taux_horaire_dimanche} onChange={handleChange} step="0.5" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux férié (€)</label>
                  <input type="number" name="taux_horaire_ferie" value={formData.taux_horaire_ferie} onChange={handleChange} step="0.5" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien Drive Équipe</label>
                  <input type="url" name="lien_drive" value={formData.lien_drive} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien Drive Clients</label>
                  <input type="url" name="lien_drive_clients" value={formData.lien_drive_clients} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
              </div>
            </div>
          </Section>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#d85940] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#c04330] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
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
                  Enregistrer les modifications
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