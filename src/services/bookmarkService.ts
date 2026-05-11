import { collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface Bookmark {
  id?: string;
  userId: string;
  type: 'word' | 'poem' | 'literature';
  itemReference: string;
  data?: any;
  savedAt: any;
}

export async function toggleBookmark(type: 'word' | 'poem' | 'literature', itemReference: string, data?: any) {
  if (!auth.currentUser) return;

  const bookmarksPath = `users/${auth.currentUser.uid}/bookmarks`;
  const q = query(
    collection(db, bookmarksPath),
    where('type', '==', type),
    where('itemReference', '==', itemReference)
  );

  try {
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      // Unbookmark
      const docId = snapshot.docs[0].id;
      await deleteDoc(doc(db, bookmarksPath, docId));
      return false; // Not bookmarked anymore
    } else {
      // Bookmark
      await addDoc(collection(db, bookmarksPath), {
        userId: auth.currentUser.uid,
        type,
        itemReference,
        data: data || null,
        savedAt: serverTimestamp()
      });
      return true; // Now bookmarked
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, bookmarksPath);
  }
}

export function subscribeToBookmarks(type: 'word' | 'poem' | 'literature', callback: (bookmarks: Bookmark[]) => void) {
  if (!auth.currentUser) return () => {};

  const bookmarksPath = `users/${auth.currentUser.uid}/bookmarks`;
  const q = query(
    collection(db, bookmarksPath),
    where('type', '==', type),
    orderBy('savedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const bookmarks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Bookmark[];
    callback(bookmarks);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, bookmarksPath);
  });
}

export async function isBookmarked(type: 'word' | 'poem' | 'literature', itemReference: string) {
  if (!auth.currentUser) return false;

  const bookmarksPath = `users/${auth.currentUser.uid}/bookmarks`;
  const q = query(
    collection(db, bookmarksPath),
    where('type', '==', type),
    where('itemReference', '==', itemReference)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}
