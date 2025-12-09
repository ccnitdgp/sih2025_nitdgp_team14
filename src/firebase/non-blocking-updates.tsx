import { addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

// Non-blocking Firestore operations

export const setDocumentNonBlocking = (docRef, data, options = {}) => {
  setDoc(docRef, data, options)
    .then(() => {
      console.log("Document successfully set!");
    })
    .catch((e) => {
      console.error("Error setting document: ", e);
      toast({ variant: 'destructive', title: 'Error', description: 'There was a problem setting the document.' });
    });
};

export const addDocumentNonBlocking = async (collectionRef, data) => {
  try {
    const docRef = await addDoc(collectionRef, data);
    console.log("Document written with ID: ", docRef.id);
    return docRef;
  } catch (e) {
    console.error("Error adding document: ", e);
    toast({ variant: 'destructive', title: 'Error', description: 'There was a problem adding the document.' });
    return null;
  }
};

export const updateDocumentNonBlocking = (docRef, data) => {
  updateDoc(docRef, data)
    .then(() => {
      console.log("Document successfully updated!");
    })
    .catch((e) => {
      console.error("Error updating document: ", e);
      toast({ variant: 'destructive', title: 'Error', description: 'There was a problem updating the document.' });
    });
};

export const deleteDocumentNonBlocking = (docRef) => {
  deleteDoc(docRef)
    .then(() => {
      console.log("Document successfully deleted!");
    })
    .catch((e) => {
      console.error("Error deleting document: ", e);
      toast({ variant: 'destructive', title: 'Error', description: 'There was a problem deleting the document.' });
    });
};
