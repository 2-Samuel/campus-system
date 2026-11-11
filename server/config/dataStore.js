import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const storePath = path.join(dataDir, 'store.json');

// Ensure directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData = {
  users: [],
  students: [],
  lecturers: [],
  courses: [],
  units: [],
  teachingHistory: [],
  availability: [],
  appointments: [],
  notifications: [],
  messages: []
};

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(storePath)) {
      fs.writeFileSync(storePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      this.data = { ...defaultData };
    } else {
      try {
        const raw = fs.readFileSync(storePath, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading store.json, resetting to defaults:', err);
        this.data = { ...defaultData };
        this.save();
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(storePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving store.json:', err);
    }
  }

  get(collectionName) {
    if (!this.data[collectionName]) {
      this.data[collectionName] = [];
    }
    return this.data[collectionName];
  }

  find(collectionName, query = {}) {
    const col = this.get(collectionName);
    return col.filter(item => {
      for (const key of Object.keys(query)) {
        if (query[key] instanceof RegExp) {
          if (!query[key].test(item[key] || '')) return false;
        } else if (typeof query[key] === 'object' && query[key] !== null) {
          if (query[key].$regex) {
            const re = new RegExp(query[key].$regex, query[key].$options || 'i');
            if (!re.test(item[key] || '')) return false;
          } else if (query[key].$in) {
            if (!query[key].$in.includes(item[key])) return false;
          }
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const results = this.find(collectionName, query);
    return results.length > 0 ? results[0] : null;
  }

  findById(collectionName, id) {
    const col = this.get(collectionName);
    return col.find(item => item._id === id || item.id === id) || null;
  }

  insert(collectionName, doc) {
    const col = this.get(collectionName);
    const newDoc = {
      _id: doc._id || 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    col.push(newDoc);
    this.save();
    return newDoc;
  }

  update(collectionName, query, updates) {
    const col = this.get(collectionName);
    let count = 0;
    col.forEach((item, index) => {
      let matches = true;
      for (const key of Object.keys(query)) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        col[index] = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        count++;
      }
    });
    if (count > 0) this.save();
    return count;
  }

  findByIdAndUpdate(collectionName, id, updates) {
    const col = this.get(collectionName);
    const index = col.findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      col[index] = {
        ...col[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return col[index];
    }
    return null;
  }

  delete(collectionName, query) {
    let col = this.get(collectionName);
    const initialLen = col.length;
    this.data[collectionName] = col.filter(item => {
      for (const key of Object.keys(query)) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    if (this.data[collectionName].length !== initialLen) {
      this.save();
      return initialLen - this.data[collectionName].length;
    }
    return 0;
  }

  findByIdAndDelete(collectionName, id) {
    const col = this.get(collectionName);
    const index = col.findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      const deleted = col.splice(index, 1)[0];
      this.save();
      return deleted;
    }
    return null;
  }

  clear(collectionName) {
    this.data[collectionName] = [];
    this.save();
  }
}

export const dbStore = new DataStore();
