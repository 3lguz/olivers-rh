// src/lib/firebase.js
// INSTRUÇÃO: Substitua os valores abaixo pelos do seu projeto Firebase
// Acesse: https://console.firebase.google.com -> Seu projeto -> Configurações -> Apps

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// ─── Helpers genéricos ────────────────────────────────────────────────────────
export const getAll = async (col) => {
  const snap = await getDocs(collection(db, col))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getOne = async (col, id) => {
  const snap = await getDoc(doc(db, col, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const create = async (col, data) => {
  const ref = await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export const update = async (col, id, data) => {
  await updateDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() })
}

export const remove = async (col, id) => {
  await deleteDoc(doc(db, col, id))
}

export const queryCol = async (col, filters = [], order = null) => {
  let q = collection(db, col)
  const constraints = filters.map(([field, op, val]) => where(field, op, val))
  if (order) constraints.push(orderBy(order))
  q = query(q, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export { serverTimestamp, Timestamp }
