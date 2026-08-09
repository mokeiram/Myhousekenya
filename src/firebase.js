import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5isCybWwGjmZ1fFmmeqToDwVXrgai5wU",
  authDomain: "myhousekenya.firebaseapp.com",
  projectId: "myhousekenya",
  storageBucket: "myhousekenya.firebasestorage.app",
  messagingSenderId: "982082354935",
  appId: "1:982082354935:web:4aa7550273932928d0ddf2",
  measurementId: "G-0Q8DNCN3SN",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const listingsRef = collection(db, "listings");

export function subscribeToListings(callback) {
  const q = query(listingsRef, orderBy("postedAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (error) => {
      console.error("Failed to load listings:", error);
      callback([]);
    }
  );
}

export async function addListing(data) {
  return addDoc(listingsRef, data);
}

export async function deleteListing(id) {
  return deleteDoc(doc(db, "listings", id));
}
