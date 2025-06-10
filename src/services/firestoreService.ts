import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface Subject {
  id: string;
  name: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  zoomUrl?: string;
  duration: string;
  playsUsed: number;
  maxPlays: number;
  createdAt: any;
}

export interface CourseCard {
  id: string;
  subjectId: string;
  name: string; // Custom name instead of month/year
  description?: string;
  price: number;
  isFree: boolean;
  isPurchased: boolean;
  videos: Video[];
  createdAt: any;
  updatedAt: any;
}

export interface UserProgress {
  id: string;
  userId: string;
  videoId: string;
  playsUsed: number;
  lastWatched: any;
}

export interface Purchase {
  id: string;
  userId: string;
  courseCardId: string;
  amount: number;
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  purchasedAt: any;
}

// Subjects
export const createSubject = async (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'subjects'), {
      ...subject,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};

export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Subject[];
  } catch (error) {
    console.error('Error getting subjects:', error);
    throw error;
  }
};

export const updateSubject = async (subjectId: string, updates: Partial<Subject>) => {
  try {
    const docRef = doc(db, 'subjects', subjectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (subjectId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Delete the subject
    const subjectRef = doc(db, 'subjects', subjectId);
    batch.delete(subjectRef);
    
    // Delete all course cards associated with this subject
    const courseCardsQuery = query(collection(db, 'courseCards'), where('subjectId', '==', subjectId));
    const courseCardsSnapshot = await getDocs(courseCardsQuery);
    
    const courseCardIds: string[] = [];
    courseCardsSnapshot.docs.forEach((courseCardDoc) => {
      courseCardIds.push(courseCardDoc.id);
      batch.delete(courseCardDoc.ref);
    });
    
    // Delete all videos associated with these course cards
    if (courseCardIds.length > 0) {
      const videosQuery = query(collection(db, 'videos'), where('courseCardId', 'in', courseCardIds));
      const videosSnapshot = await getDocs(videosQuery);
      
      const videoIds: string[] = [];
      videosSnapshot.docs.forEach((videoDoc) => {
        videoIds.push(videoDoc.id);
        batch.delete(videoDoc.ref);
      });
      
      // Delete all user progress for these videos
      if (videoIds.length > 0) {
        const progressQuery = query(collection(db, 'userProgress'), where('videoId', 'in', videoIds));
        const progressSnapshot = await getDocs(progressQuery);
        
        progressSnapshot.docs.forEach((progressDoc) => {
          batch.delete(progressDoc.ref);
        });
      }
      
      // Delete all purchases for these course cards
      const purchasesQuery = query(collection(db, 'purchases'), where('courseCardId', 'in', courseCardIds));
      const purchasesSnapshot = await getDocs(purchasesQuery);
      
      purchasesSnapshot.docs.forEach((purchaseDoc) => {
        batch.delete(purchaseDoc.ref);
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

// Course Cards
export const createCourseCard = async (courseCard: Omit<CourseCard, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'courseCards'), {
      ...courseCard,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating course card:', error);
    throw error;
  }
};

export const getCourseCards = async (): Promise<CourseCard[]> => {
  try {
    const q = query(collection(db, 'courseCards'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const courseCards: CourseCard[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const videos = await getVideosForCourseCard(docSnap.id);
      
      courseCards.push({
        id: docSnap.id,
        ...data,
        videos
      } as CourseCard);
    }
    
    return courseCards;
  } catch (error) {
    console.error('Error getting course cards:', error);
    throw error;
  }
};

export const getCourseCardsBySubject = async (subjectId: string): Promise<CourseCard[]> => {
  try {
    const q = query(
      collection(db, 'courseCards'), 
      where('subjectId', '==', subjectId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const courseCards: CourseCard[] = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const videos = await getVideosForCourseCard(docSnap.id);
      
      courseCards.push({
        id: docSnap.id,
        ...data,
        videos
      } as CourseCard);
    }
    
    return courseCards;
  } catch (error) {
    console.error('Error getting course cards by subject:', error);
    throw error;
  }
};

export const getCourseCard = async (cardId: string): Promise<CourseCard | null> => {
  try {
    const docRef = doc(db, 'courseCards', cardId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const videos = await getVideosForCourseCard(cardId);
      return {
        id: docSnap.id,
        ...docSnap.data(),
        videos
      } as CourseCard;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting course card:', error);
    throw error;
  }
};

export const updateCourseCard = async (cardId: string, updates: Partial<CourseCard>) => {
  try {
    const docRef = doc(db, 'courseCards', cardId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating course card:', error);
    throw error;
  }
};

export const deleteCourseCard = async (cardId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Delete the course card
    const cardRef = doc(db, 'courseCards', cardId);
    batch.delete(cardRef);
    
    // Delete all videos associated with this course card
    const videosQuery = query(collection(db, 'videos'), where('courseCardId', '==', cardId));
    const videosSnapshot = await getDocs(videosQuery);
    
    videosSnapshot.docs.forEach((videoDoc) => {
      batch.delete(videoDoc.ref);
    });
    
    // Delete all user progress for videos in this course card
    const videoIds = videosSnapshot.docs.map(doc => doc.id);
    if (videoIds.length > 0) {
      const progressQuery = query(collection(db, 'userProgress'), where('videoId', 'in', videoIds));
      const progressSnapshot = await getDocs(progressQuery);
      
      progressSnapshot.docs.forEach((progressDoc) => {
        batch.delete(progressDoc.ref);
      });
    }
    
    // Delete all purchases for this course card
    const purchasesQuery = query(collection(db, 'purchases'), where('courseCardId', '==', cardId));
    const purchasesSnapshot = await getDocs(purchasesQuery);
    
    purchasesSnapshot.docs.forEach((purchaseDoc) => {
      batch.delete(purchaseDoc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting course card:', error);
    throw error;
  }
};

// Videos
export const addVideoToCourseCard = async (courseCardId: string, video: Omit<Video, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'videos'), {
      ...video,
      courseCardId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding video:', error);
    throw error;
  }
};

export const updateVideo = async (videoId: string, updates: Partial<Video>) => {
  try {
    const docRef = doc(db, 'videos', videoId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

export const deleteVideo = async (videoId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Delete the video
    const videoRef = doc(db, 'videos', videoId);
    batch.delete(videoRef);
    
    // Delete all user progress for this video
    const progressQuery = query(collection(db, 'userProgress'), where('videoId', '==', videoId));
    const progressSnapshot = await getDocs(progressQuery);
    
    progressSnapshot.docs.forEach((progressDoc) => {
      batch.delete(progressDoc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

export const getVideosForCourseCard = async (courseCardId: string): Promise<Video[]> => {
  try {
    const q = query(
      collection(db, 'videos'), 
      where('courseCardId', '==', courseCardId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];
  } catch (error) {
    console.error('Error getting videos:', error);
    throw error;
  }
};

export const getVideo = async (videoId: string): Promise<Video | null> => {
  try {
    const docRef = doc(db, 'videos', videoId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Video;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting video:', error);
    throw error;
  }
};

// User Progress
export const getUserProgress = async (userId: string, videoId: string): Promise<UserProgress | null> => {
  try {
    const q = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId),
      where('videoId', '==', videoId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as UserProgress;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (userId: string, videoId: string) => {
  try {
    const existingProgress = await getUserProgress(userId, videoId);
    
    if (existingProgress) {
      const docRef = doc(db, 'userProgress', existingProgress.id);
      await updateDoc(docRef, {
        playsUsed: increment(1),
        lastWatched: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'userProgress'), {
        userId,
        videoId,
        playsUsed: 1,
        lastWatched: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// Purchases
export const createPurchase = async (purchase: Omit<Purchase, 'id' | 'purchasedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'purchases'), {
      ...purchase,
      purchasedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
};

export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  try {
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('purchasedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Purchase[];
  } catch (error) {
    console.error('Error getting user purchases:', error);
    throw error;
  }
};

export const updatePurchaseStatus = async (purchaseId: string, status: Purchase['status']) => {
  try {
    const docRef = doc(db, 'purchases', purchaseId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error('Error updating purchase status:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToSubjects = (callback: (subjects: Subject[]) => void) => {
  const q = query(collection(db, 'subjects'), orderBy('name', 'asc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const subjects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Subject[];
    
    callback(subjects);
  });
};

export const subscribeToCourseCards = (callback: (courseCards: CourseCard[]) => void) => {
  const q = query(collection(db, 'courseCards'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, async (querySnapshot) => {
    const courseCards: CourseCard[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const videos = await getVideosForCourseCard(docSnap.id);
      
      courseCards.push({
        id: docSnap.id,
        ...data,
        videos
      } as CourseCard);
    }
    
    callback(courseCards);
  });
};

export const subscribeToUserProgress = (userId: string, callback: (progress: UserProgress[]) => void) => {
  const q = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const progress = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProgress[];
    
    callback(progress);
  });
};