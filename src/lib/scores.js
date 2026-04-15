import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const SCORES_COLLECTION = 'scores';

export async function fetchTopScores(limitN = 10) {
  const q = query(
    collection(db, SCORES_COLLECTION),
    orderBy('score', 'desc'),
    limit(limitN)
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function submitScore({ name, score }) {
  return addDoc(collection(db, SCORES_COLLECTION), {
    name,
    score,
    createdAt: serverTimestamp(),
  });
}

export function isQualifyingScore(score, topScores, limitN = 10) {
  if (score <= 0) return false;
  if (!topScores || topScores.length < limitN) return true;
  return score > topScores[topScores.length - 1].score;
}
