import { Contact, ContactGroup, ContactSource } from '../types';

/**
 * @desc Contact management service
 * Handles CRUD operations for contacts with support for various import sources
 * Production-ready with localStorage persistence and backend-ready structure
 */

const CONTACTS_STORAGE_KEY = 'kithly_contacts';
const CONTACT_GROUPS_STORAGE_KEY = 'kithly_contact_groups';

// ============================================
// MOCK DATA (Development)
// ============================================

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'John Mwamba',
    phone: '+260 97 123 4567',
    email: 'john.mwamba@email.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Mwamba&background=random',
    source: 'manual',
    isFavorite: true,
    tags: ['Family'],
    createdAt: new Date().toISOString(),
    lastContacted: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Sarah Banda',
    phone: '+260 96 234 5678',
    email: 'sarah.banda@email.com',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Banda&background=random',
    source: 'manual',
    isFavorite: false,
    tags: ['Friends'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Peter Lungu',
    phone: '+260 95 345 6789',
    avatar: 'https://ui-avatars.com/api/?name=Peter+Lungu&background=random',
    source: 'manual',
    isFavorite: true,
    tags: ['Work'],
    createdAt: new Date().toISOString()
  }
];

// ============================================
// STORAGE FUNCTIONS
// ============================================

function getStoredContacts(): Contact[] {
  try {
    const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_CONTACTS;
  } catch (error) {
    console.error('Error loading contacts:', error);
    return MOCK_CONTACTS;
  }
}

function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving contacts:', error);
  }
}

function getStoredGroups(): ContactGroup[] {
  try {
    const stored = localStorage.getItem(CONTACT_GROUPS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading contact groups:', error);
    return [];
  }
}

function saveGroups(groups: ContactGroup[]): void {
  try {
    localStorage.setItem(CONTACT_GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (error) {
    console.error('Error saving contact groups:', error);
  }
}

// ============================================
// CONTACT CRUD OPERATIONS
// ============================================

export async function getAllContacts(): Promise<Contact[]> {
  // In production, replace with: return await api.get('/contacts');
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredContacts()), 100);
  });
}

export async function getContactById(id: string): Promise<Contact | null> {
  const contacts = getStoredContacts();
  return contacts.find(c => c.id === id) || null;
}

export async function createContact(contactData: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
  const contacts = getStoredContacts();
  const newContact: Contact = {
    ...contactData,
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  contacts.push(newContact);
  saveContacts(contacts);

  // In production: return await api.post('/contacts', newContact);
  return newContact;
}

export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
  const contacts = getStoredContacts();
  const index = contacts.findIndex(c => c.id === id);

  if (index === -1) return null;

  contacts[index] = { ...contacts[index], ...updates };
  saveContacts(contacts);

  // In production: return await api.put(`/contacts/${id}`, updates);
  return contacts[index];
}

export async function deleteContact(id: string): Promise<boolean> {
  const contacts = getStoredContacts();
  const filtered = contacts.filter(c => c.id !== id);

  if (filtered.length === contacts.length) return false;

  saveContacts(filtered);

  // In production: return await api.delete(`/contacts/${id}`);
  return true;
}

export async function toggleFavorite(id: string): Promise<Contact | null> {
  const contact = await getContactById(id);
  if (!contact) return null;

  return await updateContact(id, { isFavorite: !contact.isFavorite });
}

// ============================================
// CONTACT SEARCH & FILTER
// ============================================

export async function searchContacts(query: string): Promise<Contact[]> {
  const contacts = await getAllContacts();

  if (!query.trim()) return contacts;

  const lowerQuery = query.toLowerCase();

  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(lowerQuery) ||
    contact.phone.toLowerCase().includes(lowerQuery) ||
    contact.email?.toLowerCase().includes(lowerQuery) ||
    contact.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export async function getContactsByTag(tag: string): Promise<Contact[]> {
  const contacts = await getAllContacts();
  return contacts.filter(contact => contact.tags.includes(tag));
}

export async function getFavoriteContacts(): Promise<Contact[]> {
  const contacts = await getAllContacts();
  return contacts.filter(contact => contact.isFavorite);
}

// ============================================
// CONTACT GROUPS
// ============================================

export async function getAllGroups(): Promise<ContactGroup[]> {
  return getStoredGroups();
}

export async function createGroup(name: string, color: string): Promise<ContactGroup> {
  const groups = getStoredGroups();
  const newGroup: ContactGroup = {
    id: `group_${Date.now()}`,
    name,
    color,
    contactIds: []
  };

  groups.push(newGroup);
  saveGroups(groups);

  return newGroup;
}

export async function addContactToGroup(contactId: string, groupId: string): Promise<boolean> {
  const groups = getStoredGroups();
  const group = groups.find(g => g.id === groupId);

  if (!group) return false;

  if (!group.contactIds.includes(contactId)) {
    group.contactIds.push(contactId);
    saveGroups(groups);
  }

  return true;
}

export async function removeContactFromGroup(contactId: string, groupId: string): Promise<boolean> {
  const groups = getStoredGroups();
  const group = groups.find(g => g.id === groupId);

  if (!group) return false;

  group.contactIds = group.contactIds.filter(id => id !== contactId);
  saveGroups(groups);

  return true;
}

// ============================================
// CONTACT IMPORT FUNCTIONS
// ============================================

/**
 * Parse vCard format (VCF file)
 * Basic implementation - can be extended for full vCard 3.0/4.0 support
 */
export function parseVCard(vcardText: string): Omit<Contact, 'id' | 'createdAt'>[] {
  const contacts: Omit<Contact, 'id' | 'createdAt'>[] = [];
  const vcards = vcardText.split('BEGIN:VCARD');

  vcards.forEach(vcard => {
    if (!vcard.trim()) return;

    const lines = vcard.split('\n');
    let name = '';
    let phone = '';
    let email = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('FN:')) {
        name = trimmed.substring(3);
      } else if (trimmed.startsWith('TEL')) {
        phone = trimmed.split(':')[1] || '';
      } else if (trimmed.startsWith('EMAIL')) {
        email = trimmed.split(':')[1] || '';
      }
    });

    if (name && phone) {
      contacts.push({
        name,
        phone,
        email: email || undefined,
        source: 'imported',
        isFavorite: false,
        tags: []
      });
    }
  });

  return contacts;
}

/**
 * Parse CSV format
 * Expected columns: name, phone, email (optional)
 */
export function parseCSV(csvText: string): Omit<Contact, 'id' | 'createdAt'>[] {
  const contacts: Omit<Contact, 'id' | 'createdAt'>[] = [];
  const lines = csvText.split('\n');

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [name, phone, email] = line.split(',').map(s => s.trim());

    if (name && phone) {
      contacts.push({
        name,
        phone,
        email: email || undefined,
        source: 'imported',
        isFavorite: false,
        tags: []
      });
    }
  }

  return contacts;
}

/**
 * Import contacts from file
 */
export async function importContactsFromFile(file: File): Promise<Contact[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        let parsedContacts: Omit<Contact, 'id' | 'createdAt'>[] = [];

        if (file.name.endsWith('.vcf')) {
          parsedContacts = parseVCard(text);
        } else if (file.name.endsWith('.csv')) {
          parsedContacts = parseCSV(text);
        } else {
          reject(new Error('Unsupported file format. Please use VCF or CSV.'));
          return;
        }

        // Create all contacts
        const created: Contact[] = [];
        for (const contactData of parsedContacts) {
          const contact = await createContact(contactData);
          created.push(contact);
        }

        resolve(created);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Google Contacts API integration (placeholder)
 * In production, implement OAuth 2.0 flow and API calls
 */
export async function importFromGoogle(): Promise<Contact[]> {
  // Placeholder for Google Contacts API integration
  // In production:
  // 1. Initiate OAuth 2.0 flow
  // 2. Get access token
  // 3. Call Google People API
  // 4. Parse and create contacts

  console.log('Google Contacts import - requires OAuth setup');
  throw new Error('Google Contacts import not yet implemented. Please use manual import or file upload.');
}

/**
 * iPhone/iOS Contacts integration (placeholder)
 * In production, requires native iOS integration
 */
export async function importFromiPhone(): Promise<Contact[]> {
  // Placeholder for iOS Contacts framework integration
  // In production (if building with Capacitor/React Native):
  // 1. Request contacts permission
  // 2. Use Contacts framework
  // 3. Parse and create contacts

  console.log('iPhone Contacts import - requires native integration');
  throw new Error('iPhone Contacts import not yet implemented. Please export contacts as VCF and upload.');
}

/**
 * Export contacts to VCF format
 */
export function exportToVCard(contacts: Contact[]): string {
  let vcardText = '';

  contacts.forEach(contact => {
    vcardText += 'BEGIN:VCARD\n';
    vcardText += 'VERSION:3.0\n';
    vcardText += `FN:${contact.name}\n`;
    vcardText += `TEL:${contact.phone}\n`;
    if (contact.email) {
      vcardText += `EMAIL:${contact.email}\n`;
    }
    vcardText += 'END:VCARD\n';
  });

  return vcardText;
}

/**
 * Download contacts as VCF file
 */
export function downloadContactsAsVCF(contacts: Contact[], filename: string = 'contacts.vcf'): void {
  const vcardText = exportToVCard(contacts);
  const blob = new Blob([vcardText], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Get contact statistics
 */
export async function getContactStats() {
  const contacts = await getAllContacts();

  return {
    total: contacts.length,
    favorites: contacts.filter(c => c.isFavorite).length,
    withEmail: contacts.filter(c => c.email).length,
    bySource: {
      manual: contacts.filter(c => c.source === 'manual').length,
      google: contacts.filter(c => c.source === 'google').length,
      iphone: contacts.filter(c => c.source === 'iphone').length,
      imported: contacts.filter(c => c.source === 'imported').length
    }
  };
}
