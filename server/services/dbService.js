import { dbStore } from '../config/dataStore.js';
import { getIsMongoConnected } from '../config/db.js';
import {
  User, Student, Lecturer, Course, Unit,
  TeachingHistory, Availability, Appointment,
  Notification, Message
} from '../models/schemas.js';

const models = {
  users: User,
  students: Student,
  lecturers: Lecturer,
  courses: Course,
  units: Unit,
  teachingHistory: TeachingHistory,
  availability: Availability,
  appointments: Appointment,
  notifications: Notification,
  messages: Message
};

export const db = {
  async find(collection, query = {}) {
    if (getIsMongoConnected()) {
      return await models[collection].find(query).lean();
    }
    return dbStore.find(collection, query);
  },

  async findOne(collection, query = {}) {
    if (getIsMongoConnected()) {
      return await models[collection].findOne(query).lean();
    }
    return dbStore.findOne(collection, query);
  },

  async findById(collection, id) {
    if (getIsMongoConnected()) {
      return await models[collection].findById(id).lean();
    }
    return dbStore.findById(collection, id);
  },

  async insert(collection, doc) {
    if (getIsMongoConnected()) {
      const created = await models[collection].create(doc);
      return created.toObject();
    }
    return dbStore.insert(collection, doc);
  },

  async update(collection, query, updates) {
    if (getIsMongoConnected()) {
      const res = await models[collection].updateMany(query, { $set: updates });
      return res.modifiedCount;
    }
    return dbStore.update(collection, query, updates);
  },

  async updateOne(collection, query, updates) {
    if (getIsMongoConnected()) {
      const updated = await models[collection].findOneAndUpdate(query, { $set: updates }, { new: true }).lean();
      return updated;
    }
    const item = dbStore.findOne(collection, query);
    if (!item) return null;
    return dbStore.findByIdAndUpdate(collection, item._id, updates);
  },

  async findByIdAndUpdate(collection, id, updates) {
    if (getIsMongoConnected()) {
      return await models[collection].findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    }
    return dbStore.findByIdAndUpdate(collection, id, updates);
  },

  async delete(collection, query) {
    if (getIsMongoConnected()) {
      const res = await models[collection].deleteMany(query);
      return res.deletedCount;
    }
    return dbStore.delete(collection, query);
  },

  async findByIdAndDelete(collection, id) {
    if (getIsMongoConnected()) {
      return await models[collection].findByIdAndDelete(id).lean();
    }
    return dbStore.findByIdAndDelete(collection, id);
  }
};
