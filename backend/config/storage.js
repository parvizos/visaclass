// Simple in-memory storage to replace Firebase
class MemoryStorage {
  constructor() {
    this.collections = {
      contacts: [],
      applications: [],
      messages: [],
    };
  }

  // Add document to collection
  async add(collectionName, data) {
    const collection = this.collections[collectionName];
    const doc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    collection.push(doc);
    return { id: doc.id };
  }

  // Get all documents from collection
  async getCollection(collectionName) {
    return this.collections[collectionName] || [];
  }

  // Get document by ID
  async getById(collectionName, id) {
    const collection = this.collections[collectionName];
    return collection.find(doc => doc.id === id) || null;
  }

  // Update document
  async update(collectionName, id, data) {
    const collection = this.collections[collectionName];
    const index = collection.findIndex(doc => doc.id === id);
    if (index !== -1) {
      collection[index] = { ...collection[index], ...data, updatedAt: new Date().toISOString() };
      return collection[index];
    }
    return null;
  }

  // Delete document
  async delete(collectionName, id) {
    const collection = this.collections[collectionName];
    const index = collection.findIndex(doc => doc.id === id);
    if (index !== -1) {
      const deleted = collection.splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  // Query collection with filters
  async query(collectionName, filters = {}) {
    let collection = this.collections[collectionName] || [];
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        collection = collection.filter(doc => doc[key] === filters[key]);
      }
    });
    
    return collection;
  }

  // Get collection statistics
  async getStats(collectionName) {
    const collection = this.collections[collectionName] || [];
    const stats = {
      total: collection.length,
    };

    if (collectionName === 'applications') {
      stats.byStatus = {};
      collection.forEach(app => {
        stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
      });
    }

    if (collectionName === 'contacts') {
      stats.byStatus = {};
      collection.forEach(contact => {
        stats.byStatus[contact.status] = (stats.byStatus[contact.status] || 0) + 1;
      });
    }

    return stats;
  }
}

export const storage = new MemoryStorage();
export const collections = {
  contacts: {
    add: (data) => storage.add('contacts', data),
    get: () => storage.getCollection('contacts'),
    doc: (id) => ({
      get: () => storage.getById('contacts', id),
      update: (data) => storage.update('contacts', id, data),
      delete: () => storage.delete('contacts', id),
    }),
    where: (field, value) => ({
      get: () => storage.query('contacts', { [field]: value })
    })
  },
  applications: {
    add: (data) => storage.add('applications', data),
    get: () => storage.getCollection('applications'),
    doc: (id) => ({
      get: () => storage.getById('applications', id),
      update: (data) => storage.update('applications', id, data),
      delete: () => storage.delete('applications', id),
    }),
    where: (field, value) => ({
      get: () => storage.query('applications', { [field]: value })
    })
  },
  messages: {
    add: (data) => storage.add('messages', data),
    get: () => storage.getCollection('messages'),
    doc: (id) => ({
      get: () => storage.getById('messages', id),
      update: (data) => storage.update('messages', id, data),
      delete: () => storage.delete('messages', id),
    }),
    where: (field, value) => ({
      get: () => storage.query('messages', { [field]: value })
    }),
    orderBy: (field, order = 'asc') => ({
      get: () => {
        const messages = storage.getCollection('messages');
        return messages.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          if (order === 'desc') {
            return new Date(bVal) - new Date(aVal);
          }
          return new Date(aVal) - new Date(bVal);
        });
      }
    })
  }
};

export default storage;
