import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserStats {
  streak: number;
  bestStreak: number;
  streakLastUpdated: any;
  lastActive: any;
}

export async function updateStreak() {
  if (!auth.currentUser) return;

  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userSnap = await getDoc(userRef);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  try {
    if (userSnap.exists()) {
      const data = userSnap.data();
      const lastActiveDate = data.streakLastUpdated?.toDate() || new Date(0);
      const lastActiveDay = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate()).getTime();

      const diffDays = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24));

      let newStreak = data.streak || 0;
      let newBestStreak = data.bestStreak || 0;

      if (diffDays === 1) {
        // Continuous streak
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      } else if (diffDays === 0) {
        // Already updated today
        return;
      } else {
        // First time or something went wrong
        newStreak = 1;
      }

      if (newStreak > newBestStreak) {
        newBestStreak = newStreak;
      }

      await updateDoc(userRef, {
        streak: newStreak,
        bestStreak: newBestStreak,
        streakLastUpdated: serverTimestamp(),
        lastActive: serverTimestamp()
      });
    } else {
      // First time user
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        streak: 1,
        bestStreak: 1,
        streakLastUpdated: serverTimestamp(),
        lastActive: serverTimestamp(),
        completedModules: [],
        savedPoems: []
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
  }
}

export async function getUserStats(): Promise<UserStats | null> {
  if (!auth.currentUser) return null;
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      streak: data.streak || 0,
      bestStreak: data.bestStreak || 0,
      streakLastUpdated: data.streakLastUpdated,
      lastActive: data.lastActive
    };
  }
  return null;
}
