import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export async function logActivity(type: 'dictionary_search' | 'quiz_completion' | 'pronunciation_practice' | 'literature_read', content: any) {
  if (!auth.currentUser) return;

  try {
    const historyRef = collection(db, 'users', auth.currentUser.uid, 'history');
    await addDoc(historyRef, {
      userId: auth.currentUser.uid,
      activityType: type,
      content,
      timestamp: new Date().toISOString()
    });

    // Also update user profile lastActive
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await setDoc(userRef, { 
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      lastActive: new Date().toISOString() 
    }, { merge: true });
    
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
