import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export async function logActivity(type: 'dictionary_search' | 'quiz_completion' | 'pronunciation_practice' | 'literature_read' | 'user_login' | 'word_discovery', content: any) {
  if (!auth.currentUser) return;

  const historyPath = `users/${auth.currentUser.uid}/history`;
  try {
    const historyRef = collection(db, 'users', auth.currentUser.uid, 'history');
    await addDoc(historyRef, {
      userId: auth.currentUser.uid,
      activityType: type,
      content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, historyPath);
  }

  const userPath = `users/${auth.currentUser.uid}`;
  try {
    // Also update user profile lastActive
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, { 
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      lastActive: new Date().toISOString() 
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}
