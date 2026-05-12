import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, serverTimestamp, getEffectiveUserId } from '../lib/firebase';

export async function logActivity(type: 'dictionary_search' | 'quiz_completion' | 'pronunciation_practice' | 'literature_read' | 'user_login' | 'word_discovery' | 'lesson_completion', content: any) {
  const uid = getEffectiveUserId();
  const historyPath = `users/${uid}/history`;
  
  try {
    const historyRef = collection(db, 'users', uid, 'history');
    await addDoc(historyRef, {
      userId: uid,
      activityType: type,
      content,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, historyPath);
  }

  const userPath = `users/${uid}`;
  try {
    // Also update user profile lastActive
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { 
      uid: uid,
      email: auth.currentUser?.email || 'guest@example.com',
      lastActive: serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}
