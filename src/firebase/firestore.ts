import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

// Types
export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'prof' | 'eleve';
  classId: string;
  subjectIds?: string[]; // For students: list of subjects they're enrolled in
}

export interface Class {
  id: string;
  name: string; // e.g., "6A", "Terminale S"
}

export interface Subject {
  id: string;
  name: string; // e.g., "Mathematics", "French", "History"
  classId: string; // Subject belongs to a class
  teacherId: string; // Teacher assigned to this subject
  studentIds: string[]; // List of student UIDs enrolled in this subject
}

export interface Homework {
  id: string;
  title: string;
  subjectId: string; // Links to Subject (which has classId and studentIds)
  teacherId: string;
  description: string;
  deadline: Timestamp;
  studentCompletions: { [studentId: string]: boolean }; // Track individual student completions
  fileUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Homework CRUD operations
export const getAllHomeworks = async (filters?: {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
}): Promise<Homework[]> => {
  try {
    const homeworksRef = collection(db, 'homeworks');
    const constraints: QueryConstraint[] = [];

    if (filters?.teacherId) {
      constraints.push(where('teacherId', '==', filters.teacherId));
    }
    if (filters?.subjectId) {
      constraints.push(where('subjectId', '==', filters.subjectId));
    }
    if (filters?.classId) {
      constraints.push(where('classId', '==', filters.classId));
    }

    let querySnapshot;
    if (constraints.length > 0) {
      const q = query(homeworksRef, ...constraints);
      querySnapshot = await getDocs(q);
    } else {
      querySnapshot = await getDocs(homeworksRef);
    }

    const homeworks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Homework));

    // Sort by deadline client-side
    return homeworks.sort((a, b) => b.deadline.toMillis() - a.deadline.toMillis());
  } catch (error) {
    console.error('Error getting homeworks:', error);
    throw error;
  }
};

export const getHomeworkById = async (id: string): Promise<Homework | null> => {
  try {
    const homeworkRef = doc(db, 'homeworks', id);
    const homeworkSnap = await getDoc(homeworkRef);

    if (homeworkSnap.exists()) {
      return {
        id: homeworkSnap.id,
        ...homeworkSnap.data()
      } as Homework;
    }
    return null;
  } catch (error) {
    console.error('Error getting homework:', error);
    throw error;
  }
};

export const addHomework = async (homework: Omit<Homework, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const homeworksRef = collection(db, 'homeworks');
    const docRef = await addDoc(homeworksRef, {
      ...homework,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding homework:', error);
    throw error;
  }
};

export const updateHomework = async (id: string, data: Partial<Homework>): Promise<void> => {
  try {
    const homeworkRef = doc(db, 'homeworks', id);
    await updateDoc(homeworkRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating homework:', error);
    throw error;
  }
};

export const deleteHomework = async (id: string): Promise<void> => {
  try {
    const homeworkRef = doc(db, 'homeworks', id);
    await deleteDoc(homeworkRef);
  } catch (error) {
    console.error('Error deleting homework:', error);
    throw error;
  }
};

// File upload to Firebase Storage
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// User CRUD operations
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createUser = async (uid: string, userData: Omit<User, 'uid'>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { ...userData, uid });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Class CRUD operations
export const getAllClasses = async (): Promise<Class[]> => {
  try {
    const classesRef = collection(db, 'classes');
    const querySnapshot = await getDocs(classesRef);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Class));
  } catch (error) {
    console.error('Error getting classes:', error);
    throw error;
  }
};

export const addClass = async (classData: Omit<Class, 'id'>): Promise<string> => {
  try {
    const classesRef = collection(db, 'classes');
    const docRef = await addDoc(classesRef, classData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding class:', error);
    throw error;
  }
};

export const updateClass = async (id: string, data: Partial<Class>): Promise<void> => {
  try {
    const classRef = doc(db, 'classes', id);
    await updateDoc(classRef, data);
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

export const deleteClass = async (id: string): Promise<void> => {
  try {
    const classRef = doc(db, 'classes', id);
    await deleteDoc(classRef);
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

// Subject CRUD operations
export const getAllSubjects = async (): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const querySnapshot = await getDocs(subjectsRef);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subject));
  } catch (error) {
    console.error('Error getting subjects:', error);
    throw error;
  }
};

export const getStudentSubjects = async (studentId: string): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const q = query(subjectsRef, where('studentIds', 'array-contains', studentId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subject));
  } catch (error) {
    console.error('Error getting student subjects:', error);
    throw error;
  }
};

export const getTeacherSubjects = async (teacherId: string): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const q = query(subjectsRef, where('teacherId', '==', teacherId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subject));
  } catch (error) {
    console.error('Error getting teacher subjects:', error);
    throw error;
  }
};

export const addSubject = async (subjectData: Omit<Subject, 'id'>): Promise<string> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const docRef = await addDoc(subjectsRef, subjectData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
};

export const updateSubject = async (id: string, data: Partial<Subject>): Promise<void> => {
  try {
    const subjectRef = doc(db, 'subjects', id);
    await updateDoc(subjectRef, data);
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (id: string): Promise<void> => {
  try {
    const subjectRef = doc(db, 'subjects', id);
    await deleteDoc(subjectRef);
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
