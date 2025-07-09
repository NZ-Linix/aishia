import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

import {
    ref as dbRef,
    set as dbSet,
    get as dbGet,
    update as dbUpdate,
    remove as dbRemove
} from 'firebase/database'

export const set = (path: string, data: unknown) =>
  dbSet(dbRef(db, path), data)

export const get = (path: string) =>
  dbGet(dbRef(db, path)).then(snapshot => snapshot.val())

export const update = (path: string, data: Partial<unknown>) =>
  dbUpdate(dbRef(db, path), data)

export const remove = (path: string) =>
  dbRemove(dbRef(db, path))