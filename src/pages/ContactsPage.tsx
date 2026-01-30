import React, { useState, useEffect } from 'react';
import { View, Contact, ContactGroup } from '../types';
import {
  getAllContacts,
  createContact,
  deleteContact,
  toggleFavorite,
  searchContacts,
  importContactsFromFile,
  downloadContactsAsVCF
} from '../services/contactService';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import AnimatedBackButton from '../components/AnimatedBackButton';
import Button from '../components/Button';
import {
  UserIcon,
  PhoneArrowDownIcon,
  PlusCircleIcon,
  TrashIcon,
  CloudArrowDownIcon
} from '../components/icons/NavigationIcons';
import { StarIcon } from '../components/icons/FeatureIcons';
import { toast } from 'sonner';

interface ContactsPageProps {
  setView: (view: View) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ setView }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const loadContacts = async () => {
    setIsLoading(true);
    const data = await getAllContacts();
    setContacts(data);
    setIsLoading(false);
  };

  const handleSearch = async () => {
    const results = await searchContacts(searchQuery);
    setContacts(results);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) {
      toast.error('Name and phone are required');
      return;
    }

    await createContact({
      ...newContact,
      source: 'manual',
      isFavorite: false,
      tags: []
    });

    toast.success('Contact added successfully');
    setShowAddModal(false);
    setNewContact({ name: '', phone: '', email: '' });
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
      toast.success('Contact deleted');
      loadContacts();
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
    loadContacts();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importContactsFromFile(file);
      toast.success(`Successfully imported ${imported.length} contacts`);
      loadContacts();
    } catch (error) {
      toast.error('Failed to import contacts');
      console.error(error);
    }
  };

  const handleExport = () => {
    downloadContactsAsVCF(contacts);
    toast.success('Contacts exported');
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <CustomerHeader
        setView={setView}
        cartItemCount={0}
        onCartClick={() => { }}
        targetCity="Lusaka"
        setTargetCity={() => { }}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Contacts</h1>
          <div className="flex gap-2">
            <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <CloudArrowDownIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Import</span>
              <input type="file" accept=".vcf,.csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <Button onClick={() => setShowAddModal(true)} variant="primary" className="flex items-center gap-2">
              <PlusCircleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Add Contact</span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-kithly-primary"
          />
        </div>

        {/* Contacts List */}
        {isLoading ? (
          <div className="text-center py-12">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No contacts found</h3>
            <p className="text-gray-500 mt-2">Add contacts manually or import them to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <img
                    src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=random`}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{contact.name}</h3>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                    {contact.email && <p className="text-xs text-gray-400">{contact.email}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleFavorite(contact.id)}
                    className={`p-2 rounded-full hover:bg-gray-100 ${contact.isFavorite ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    <StarIcon className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-500"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full rounded-lg border-gray-300 focus:ring-kithly-primary focus:border-kithly-primary"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50">
        <AnimatedBackButton onClick={() => setView('customerPortal')} label="Back" />
      </div>

      <Footer setView={setView} />
    </div>
  );
};

export default ContactsPage;
