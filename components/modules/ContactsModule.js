'use client';
import { useState, useEffect } from 'react';

// ==================== CONFIGURATION ====================
const ROLE_OPTIONS = [
  'Médecin traitant',
  'Médecin spécialiste',
  'Infirmier(e)',
  'Kinésithérapeute',
  'Ergothérapeute',
  'Orthophoniste',
  'Pharmacie',
  'Laboratoire',
  'Assistante sociale',
  'SSIAD',
  'HAD',
  'Tuteur / Curateur',
  'Famille',
  'Voisin(e)',
  'Autre'
];

// ==================== COMPOSANT PRINCIPAL ====================
/**
 * Module Contacts réutilisable
 * @param {string} entityType - 'beneficiaire' ou 'avs'
 * @param {string} entityId - ID de l'entité
 * @param {string} title - Titre personnalisé (optionnel)
 */
export default function ContactsModule({ entityType, entityId, title = 'Acteurs de la prise en charge' }) {
  const [contacts, setContacts] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    role: '',
    telephone: '',
    email: '',
    adresse: '',
    notes: ''
  });

  // Clé de stockage
  const storageKey = `contacts_${entityType}s`;

  // ==================== CHARGEMENT / SAUVEGARDE ====================
  useEffect(() => {
    if (entityId) {
      const allContacts = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setContacts(allContacts[entityId] || []);
    }
  }, [entityId, storageKey]);

  const saveContacts = (newContacts) => {
    const allContacts = JSON.parse(localStorage.getItem(storageKey) || '{}');
    allContacts[entityId] = newContacts;
    localStorage.setItem(storageKey, JSON.stringify(allContacts));
    setContacts(newContacts);
  };

  // ==================== FILTRAGE ====================
  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      contact.nom?.toLowerCase().includes(search) ||
      contact.role?.toLowerCase().includes(search) ||
      contact.telephone?.includes(search)
    );
  });

  // ==================== GESTION CONTACTS ====================
  const handleSave = () => {
    if (!formData.nom || !formData.role) {
      alert('Veuillez renseigner au moins le nom et le rôle');
      return;
    }
    
    if (editingContact) {
      const updated = contacts.map(c => 
        c.id === editingContact.id ? { ...c, ...formData, updated_at: new Date().toISOString() } : c
      );
      saveContacts(updated);
    } else {
      const newContact = {
        ...formData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      saveContacts([...contacts, newContact]);
    }
    
    closeForm();
  };

  const handleDelete = (contactId) => {
    if (confirm('Supprimer ce contact ?')) {
      saveContacts(contacts.filter(c => c.id !== contactId));
      closeForm();
    }
  };

  const openEditForm = (contact) => {
    setEditingContact(contact);
    setFormData({
      nom: contact.nom,
      role: contact.role,
      telephone: contact.telephone || '',
      email: contact.email || '',
      adresse: contact.adresse || '',
      notes: contact.notes || ''
    });
    setShowContactForm(true);
  };

  const closeForm = () => {
    setShowContactForm(false);
    setEditingContact(null);
    setFormData({ nom: '', role: '', telephone: '', email: '', adresse: '', notes: '' });
  };

  // ==================== RENDU ====================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} contact(s) enregistré(s)</p>
        </div>
        
        <button
          onClick={() => { setEditingContact(null); setFormData({ nom: '', role: '', telephone: '', email: '', adresse: '', notes: '' }); setShowContactForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau contact
        </button>
      </div>
      
      {/* Recherche */}
      {contacts.length > 3 && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un contact..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
          />
        </div>
      )}
      
      {/* Liste des contacts */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {searchTerm ? (
              <p>Aucun contact ne correspond à "{searchTerm}"</p>
            ) : (
              <>
                <p>Aucun contact enregistré</p>
                <p className="text-sm mt-1">Ajoutez les intervenants : médecin, kiné, infirmier...</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rôle</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Téléphone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Notes</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{contact.nom}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-[#a5fce8] text-gray-700 rounded-full text-sm">
                        {contact.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {contact.telephone ? (
                        <a href={`tel:${contact.telephone}`} className="text-[#d85940] hover:underline flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {contact.telephone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="text-[#d85940] hover:underline truncate block max-w-[200px]">
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm max-w-xs truncate hidden lg:table-cell">
                      {contact.notes || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(contact)}
                          className="p-2 text-gray-400 hover:text-[#d85940] transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Cartes pour mobile (alternative au tableau) */}
      <div className="sm:hidden space-y-3">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">{contact.nom}</p>
                <span className="inline-block px-2 py-1 bg-[#a5fce8] text-gray-700 rounded-full text-xs mt-1">
                  {contact.role}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditForm(contact)} className="p-2 text-gray-400 hover:text-[#d85940]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(contact.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-3 space-y-1 text-sm">
              {contact.telephone && (
                <a href={`tel:${contact.telephone}`} className="flex items-center gap-2 text-[#d85940]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {contact.telephone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-[#d85940] truncate">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {contact.email}
                </a>
              )}
              {contact.notes && (
                <p className="text-gray-500">{contact.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingContact ? 'Modifier le contact' : 'Nouveau contact'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Dr. Martin, Cabinet Kiné..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle / Fonction *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  {ROLE_OPTIONS.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="01 23 45 67 89"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.fr"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="12 rue de la Santé, 75000 Paris"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  placeholder="Horaires, spécialité, informations utiles..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-[#d85940] text-white py-2 px-4 rounded-lg hover:bg-[#c04330] transition-colors">
                {editingContact ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editingContact && (
                <button onClick={() => handleDelete(editingContact.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                  Supprimer
                </button>
              )}
              <button onClick={closeForm} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}