'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// ========== COMPOSANTS ==========
const Section = ({ id, title, icon, children, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="flex items-center gap-2 font-medium text-gray-700">
        <span>{icon}</span>{title}
      </span>
      <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && <div className="p-4 bg-white">{children}</div>}
  </div>
);

const TagList = ({ items, field, onRemove }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {items?.map((item, index) => (
      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-[#a5fce8] text-gray-700 rounded-full text-sm">
        {item}
        <button type="button" onClick={() => onRemove(field, index)} className="hover:text-red-600">×</button>
      </span>
    ))}
  </div>
);

// ========== COMPOSANT PRINCIPAL ==========
export default function EditBeneficiairePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    civil: true,
    coordonnees: true,
    confiance: true,
    medical: false,
    apa: false,
    acces: false,
    admin: false
  });
  
  const [formData, setFormData] = useState({
    photo_url: '',
    civilite: 'Mme',
    nom: '',
    prenom: '',
    nom_jeune_fille: '',
    date_naissance: '',
    lieu_naissance: '',
    situation_familiale: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: '',
    telephone2: '',
    email: '',
    personne_confiance_nom: '',
    personne_confiance_telephone: '',
    personne_confiance_email: '',
    personne_confiance_relation: '',
    gir_level: '',
    has_pacemaker: false,
    ald: [],
    pathologies: [],
    allergies: [],
    problematiques_sante: '',
    problematique_mode_vie: '',
    a_apa: false,
    apa_status: '',
    apa_notes: '',
    code_boite_clef: '',
    note_boite_clef: '',
    numero_securite_sociale: '',
    numero_cesu: '',
    mutuelle: '',
    caisse_retraite: '',
    offre_type: '',
    lien_drive: '',
    lien_drive_clients: '',
    status: 'actif',
    is_hospitalized: false,
    seniorassist_enabled: false
  });

  const [newAld, setNewAld] = useState('');
  const [newPathologie, setNewPathologie] = useState('');
  const [newAllergie, setNewAllergie] = useState('');

  useEffect(() => {
    if (params.id) {
      const beneficiaires = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
      const found = beneficiaires.find(b => b.id === params.id);
      if (found) {
        setFormData({
          ...formData,
          ...found,
          ald: found.ald || [],
          pathologies: found.pathologies || [],
          allergies: found.allergies || []
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert('Veuillez sélectionner une image'); return; }
      if (file.size > 2 * 1024 * 1024) { alert('Image trop volumineuse (max 2 Mo)'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo_url: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const addToList = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), value.trim()] }));
      setter('');
    }
  };

  const removeFromList = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    const beneficiaires = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    const index = beneficiaires.findIndex(b => b.id === params.id);
    
    if (index !== -1) {
      beneficiaires[index] = { ...formData, id: params.id, updated_at: new Date().toISOString() };
      localStorage.setItem('beneficiaires', JSON.stringify(beneficiaires));
      setTimeout(() => router.push(`/dashboard/beneficiaires/${params.id}`), 500);
    } else {
      setSaving(false);
      alert('Erreur: Bénéficiaire non trouvé');
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
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Modifier le Bénéficiaire</h2>
          <p className="text-sm text-gray-500">{formData.civilite} {formData.prenom} {formData.nom}</p>
        </div>
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden sm:inline">Annuler</span>
        </button>
      </header>

      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Photo */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                {formData.photo_url ? (
                  <div className="relative">
                    <img src={formData.photo_url} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-[#74ccc3]" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">×</button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-400">
                    {formData.prenom?.[0]}{formData.nom?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                  <span>📷 {formData.photo_url ? 'Changer' : 'Ajouter'} la photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Statuts rapides */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_hospitalized" checked={formData.is_hospitalized} onChange={handleChange} className="w-5 h-5 text-red-500 rounded focus:ring-red-500" />
                <span className="text-gray-700">🏥 Hospitalisé</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="seniorassist_enabled" checked={formData.seniorassist_enabled} onChange={handleChange} className="w-5 h-5 text-[#74ccc3] rounded focus:ring-[#74ccc3]" />
                <span className="text-gray-700">📡 SeniorAssist</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Statut:</label>
                <select name="status" value={formData.status} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-[#d85940]">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
            </div>
          </div>

          {/* État civil */}
          <Section id="civil" title="État civil" icon="👤" isOpen={openSections.civil} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Civilité *</label>
                <select name="civilite" value={formData.civilite} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" required>
                  <option value="Mme">Mme</option>
                  <option value="M.">M.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de jeune fille</label>
                <input type="text" name="nom_jeune_fille" value={formData.nom_jeune_fille} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                <input type="text" name="lieu_naissance" value={formData.lieu_naissance} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situation familiale</label>
                <select name="situation_familiale" value={formData.situation_familiale} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]">
                  <option value="">-- Sélectionner --</option>
                  <option value="marie">Marié(e)</option>
                  <option value="veuf">Veuf/Veuve</option>
                  <option value="celibataire">Célibataire</option>
                  <option value="divorce">Divorcé(e)</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Coordonnées */}
          <Section id="coordonnees" title="Coordonnées" icon="📍" isOpen={openSections.coordonnees} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                <input type="text" name="code_postal" value={formData.code_postal} onChange={handleChange} maxLength="5" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone 2</label>
                <input type="tel" name="telephone2" value={formData.telephone2} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
            </div>
          </Section>

          {/* Personne de confiance */}
          <Section id="confiance" title="Personne de confiance" icon="👨‍👩‍👧" isOpen={openSections.confiance} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input type="text" name="personne_confiance_nom" value={formData.personne_confiance_nom} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <input type="text" name="personne_confiance_relation" value={formData.personne_confiance_relation} onChange={handleChange} placeholder="Ex: Fille, Fils, Neveu..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="tel" name="personne_confiance_telephone" value={formData.personne_confiance_telephone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="personne_confiance_email" value={formData.personne_confiance_email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
            </div>
          </Section>

          {/* Médical */}
          <Section id="medical" title="Informations médicales" icon="🏥" isOpen={openSections.medical} onToggle={toggleSection}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau GIR</label>
                  <select name="gir_level" value={formData.gir_level} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]">
                    <option value="">-- Non évalué --</option>
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>GIR {n}</option>)}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="has_pacemaker" checked={formData.has_pacemaker} onChange={handleChange} className="w-5 h-5 text-red-500 rounded" />
                    <span className="text-gray-700">⚠️ Pacemaker</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ALD (Affections Longue Durée)</label>
                <div className="flex gap-2">
                  <input type="text" value={newAld} onChange={(e) => setNewAld(e.target.value)} placeholder="Ajouter une ALD..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('ald', newAld, setNewAld); } }} />
                  <button type="button" onClick={() => addToList('ald', newAld, setNewAld)} className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]">+</button>
                </div>
                <TagList items={formData.ald} field="ald" onRemove={removeFromList} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pathologies</label>
                <div className="flex gap-2">
                  <input type="text" value={newPathologie} onChange={(e) => setNewPathologie(e.target.value)} placeholder="Ajouter une pathologie..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('pathologies', newPathologie, setNewPathologie); } }} />
                  <button type="button" onClick={() => addToList('pathologies', newPathologie, setNewPathologie)} className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]">+</button>
                </div>
                <TagList items={formData.pathologies} field="pathologies" onRemove={removeFromList} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                <div className="flex gap-2">
                  <input type="text" value={newAllergie} onChange={(e) => setNewAllergie(e.target.value)} placeholder="Ajouter une allergie..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('allergies', newAllergie, setNewAllergie); } }} />
                  <button type="button" onClick={() => addToList('allergies', newAllergie, setNewAllergie)} className="px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae]">+</button>
                </div>
                <TagList items={formData.allergies} field="allergies" onRemove={removeFromList} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes médicales</label>
                <textarea name="problematiques_sante" value={formData.problematiques_sante} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problématique & Mode de vie</label>
                <textarea name="problematique_mode_vie" value={formData.problematique_mode_vie} onChange={handleChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
            </div>
          </Section>

          {/* APA */}
          <Section id="apa" title="APA" icon="💶" isOpen={openSections.apa} onToggle={toggleSection}>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="a_apa" checked={formData.a_apa} onChange={handleChange} className="w-5 h-5 text-[#74ccc3] rounded" />
                <span className="text-gray-700">Bénéficie de l'APA</span>
              </label>
              {formData.a_apa && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut APA</label>
                    <select name="apa_status" value={formData.apa_status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]">
                      <option value="">-- Sélectionner --</option>
                      <option value="en_cours">En cours de demande</option>
                      <option value="accordee">Accordée</option>
                      <option value="refusee">Refusée</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes APA</label>
                    <textarea name="apa_notes" value={formData.apa_notes} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Accès domicile */}
          <Section id="acces" title="Accès au domicile" icon="🔑" isOpen={openSections.acces} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code boîte à clef</label>
                <input type="text" name="code_boite_clef" value={formData.code_boite_clef} onChange={handleChange} placeholder="Ex: 1234" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] font-mono text-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement / Notes</label>
                <input type="text" name="note_boite_clef" value={formData.note_boite_clef} onChange={handleChange} placeholder="Ex: À droite de la porte, sous le pot..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
            </div>
          </Section>

          {/* Administratif */}
          <Section id="admin" title="Administratif & Documents" icon="📋" isOpen={openSections.admin} onToggle={toggleSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Sécurité Sociale</label>
                <input type="text" name="numero_securite_sociale" value={formData.numero_securite_sociale} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° CESU</label>
                <input type="text" name="numero_cesu" value={formData.numero_cesu} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutuelle</label>
                <input type="text" name="mutuelle" value={formData.mutuelle} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caisse de retraite</label>
                <input type="text" name="caisse_retraite" value={formData.caisse_retraite} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offre souscrite</label>
                <select name="offre_type" value={formData.offre_type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]">
                  <option value="">-- Sélectionner --</option>
                  <option value="coordination">Coordination</option>
                  <option value="coordination_couple">Coordination Couple</option>
                  <option value="coordination_plus">Coordination Plus</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien Drive Équipe</label>
                  <input type="url" name="lien_drive" value={formData.lien_drive} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien Drive Famille</label>
                  <input type="url" name="lien_drive_clients" value={formData.lien_drive_clients} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]" />
                </div>
              </div>
            </div>
          </Section>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="submit" disabled={saving} className="flex-1 bg-[#d85940] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#c04330] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Enregistrement...
                </>
              ) : (
                <>✓ Enregistrer les modifications</>
              )}
            </button>
            <button type="button" onClick={() => router.back()} className="sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Annuler</button>
          </div>
        </form>
      </div>
    </>
  );
}