import { collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getEffectiveUserId } from '../lib/firebase';

export interface Note {
  id?: string;
  userId: string;
  title: string;
  content: string;
  timestamp: any;
  tags?: string[];
}

export async function saveNote(title: string, content: string, tags: string[] = []) {
  const uid = getEffectiveUserId();
  const notesPath = `users/${uid}/notes`;
  
  try {
    const docRef = await addDoc(collection(db, notesPath), {
      userId: uid,
      title,
      content,
      tags,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, notesPath);
  }
}

export async function updateNote(noteId: string, title: string, content: string, tags: string[] = []) {
  const uid = getEffectiveUserId();
  const noteRef = doc(db, `users/${uid}/notes/${noteId}`);
  
  try {
    await updateDoc(noteRef, {
      title,
      content,
      tags,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}/notes/${noteId}`);
  }
}

export async function deleteNote(noteId: string) {
  const uid = getEffectiveUserId();
  const noteRef = doc(db, `users/${uid}/notes/${noteId}`);
  
  try {
    await deleteDoc(noteRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}/notes/${noteId}`);
  }
}

export function subscribeToNotes(callback: (notes: Note[]) => void) {
  const uid = getEffectiveUserId();
  const notesPath = `users/${uid}/notes`;
  
  const q = query(
    collection(db, notesPath),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
    callback(notes);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, notesPath);
  });
}
