const postgresConfig = require('./postgres-config');
const firebaseAdmin = require('firebase-admin');

// Initialize Firebase Admin (if credentials are provided)
let firebaseDb = null;
try {
  if (process.env.FIREBASE_PROJECT_ID) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    firebaseDb = firebaseAdmin.firestore();
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error.message);
}

class DatabaseAdapter {
  constructor() {
    this.postgres = postgresConfig;
    this.firebase = firebaseDb;
    this.primaryDb = process.env.PRIMARY_DATABASE || 'postgres';
  }

  // Generic CRUD operations that work with both databases
  async create(collection, data) {
    if (this.primaryDb === 'postgres') {
      return await this.createPostgres(collection, data);
    } else if (this.firebase) {
      return await this.createFirebase(collection, data);
    }
    throw new Error('No database available');
  }

  async read(collection, id) {
    if (this.primaryDb === 'postgres') {
      return await this.readPostgres(collection, id);
    } else if (this.firebase) {
      return await this.readFirebase(collection, id);
    }
    throw new Error('No database available');
  }

  async update(collection, id, data) {
    if (this.primaryDb === 'postgres') {
      return await this.updatePostgres(collection, id, data);
    } else if (this.firebase) {
      return await this.updateFirebase(collection, id, data);
    }
    throw new Error('No database available');
  }

  async delete(collection, id) {
    if (this.primaryDb === 'postgres') {
      return await this.deletePostgres(collection, id);
    } else if (this.firebase) {
      return await this.deleteFirebase(collection, id);
    }
    throw new Error('No database available');
  }

  // Data migration helper
  async migrateFromFirebaseToPostgres(collection, table) {
    if (!this.firebase) {
      throw new Error('Firebase not initialized');
    }

    const snapshot = await this.firebase.collection(collection).get();
    const migrationResults = [];

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        const result = await this.createPostgres(table, {
          firebase_id: doc.id,
          ...data,
          migrated_at: new Date()
        });
        migrationResults.push({ success: true, id: doc.id, postgres_id: result.id });
      } catch (error) {
        migrationResults.push({ success: false, id: doc.id, error: error.message });
      }
    }

    return migrationResults;
  }
}

module.exports = new DatabaseAdapter();