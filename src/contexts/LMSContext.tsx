import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getCourseCards,
  getCourseCard,
  createCourseCard,
  updateCourseCard,
  deleteCourseCard,
  addVideoToCourseCard,
  updateVideo,
  deleteVideo,
  getUserProgress,
  updateUserProgress,
  createPurchase,
  getUserPurchases,
  updatePurchaseStatus,
  subscribeToSubjects,
  subscribeToCourseCards,
  subscribeToUserProgress,
  type Subject,
  type CourseCard,
  type Video,
  type UserProgress
} from '../services/firestoreService';

interface LMSContextType {
  subjects: Subject[];
  courseCards: CourseCard[];
  userProgress: UserProgress[];
  userPurchases: string[];
  getCurrentMonthCard: () => CourseCard | null;
  purchaseCard: (cardId: string) => Promise<void>;
  playVideo: (videoId: string) => Promise<void>;
  
  // Subject management
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubject: (subjectId: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  
  // Course card management
  addCourseCard: (card: Omit<CourseCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCourseCard: (cardId: string, updates: Partial<CourseCard>) => Promise<void>;
  deleteCourseCard: (cardId: string) => Promise<void>;
  
  // Video management
  addVideoToCard: (cardId: string, video: Omit<Video, 'id' | 'createdAt'>) => Promise<void>;
  updateVideo: (videoId: string, updates: Partial<Video>) => Promise<void>;
  deleteVideo: (videoId: string) => Promise<void>;
  
  getVideoWithProgress: (videoId: string) => Video | null;
  getCourseCardsBySubject: (subjectId: string) => CourseCard[];
  loading: boolean;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export function useLMS() {
  const context = useContext(LMSContext);
  if (context === undefined) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
}

interface LMSProviderProps {
  children: ReactNode;
}

export function LMSProvider({ children }: LMSProviderProps) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courseCards, setCourseCards] = useState<CourseCard[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data and set up real-time listeners
  useEffect(() => {
    let unsubscribeSubjects: (() => void) | null = null;
    let unsubscribeCourseCards: (() => void) | null = null;
    let unsubscribeUserProgress: (() => void) | null = null;

    const initializeData = async () => {
      try {
        // Set up real-time listener for subjects
        unsubscribeSubjects = subscribeToSubjects((subjects) => {
          setSubjects(subjects);
        });

        // Set up real-time listener for course cards
        unsubscribeCourseCards = subscribeToCourseCards((cards) => {
          setCourseCards(cards);
          setLoading(false);
        });

        // Load user-specific data if user is logged in
        if (user) {
          // Set up real-time listener for user progress
          unsubscribeUserProgress = subscribeToUserProgress(user.id, (progress) => {
            setUserProgress(progress);
          });

          // Load user purchases
          const purchases = await getUserPurchases(user.id);
          setUserPurchases(purchases.map(p => p.courseCardId));
        }
      } catch (error) {
        console.error('Error initializing LMS data:', error);
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeSubjects) unsubscribeSubjects();
      if (unsubscribeCourseCards) unsubscribeCourseCards();
      if (unsubscribeUserProgress) unsubscribeUserProgress();
    };
  }, [user]);

  const getCurrentMonthCard = () => {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    
    return courseCards.find(card => 
      card.name.toLowerCase().includes(currentMonth.toLowerCase()) && 
      card.name.includes(currentYear.toString())
    ) || null;
  };

  const purchaseCard = async (cardId: string) => {
    if (!user) throw new Error('User must be logged in to purchase');

    try {
      // Create purchase record
      const purchaseId = await createPurchase({
        userId: user.id,
        courseCardId: cardId,
        amount: courseCards.find(c => c.id === cardId)?.price || 0,
        paymentId: `payment_${Date.now()}`, // This would come from PayHere
        status: 'pending'
      });

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update purchase status to completed
      await updatePurchaseStatus(purchaseId, 'completed');

      // Update local state
      setUserPurchases(prev => [...prev, cardId]);
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  };

  const playVideo = async (videoId: string) => {
    if (!user) throw new Error('User must be logged in to play videos');

    try {
      await updateUserProgress(user.id, videoId);
    } catch (error) {
      console.error('Error updating video progress:', error);
      throw error;
    }
  };

  // Subject management
  const addSubjectHandler = async (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSubject(subject);
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  };

  const updateSubjectHandler = async (subjectId: string, updates: Partial<Subject>) => {
    try {
      await updateSubject(subjectId, updates);
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  };

  const deleteSubjectHandler = async (subjectId: string) => {
    try {
      await deleteSubject(subjectId);
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  };

  // Course card management
  const addCourseCardHandler = async (card: Omit<CourseCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createCourseCard(card);
    } catch (error) {
      console.error('Error adding course card:', error);
      throw error;
    }
  };

  const updateCourseCardHandler = async (cardId: string, updates: Partial<CourseCard>) => {
    try {
      await updateCourseCard(cardId, updates);
    } catch (error) {
      console.error('Error updating course card:', error);
      throw error;
    }
  };

  const deleteCourseCardHandler = async (cardId: string) => {
    try {
      await deleteCourseCard(cardId);
    } catch (error) {
      console.error('Error deleting course card:', error);
      throw error;
    }
  };

  // Video management
  const addVideoToCard = async (cardId: string, video: Omit<Video, 'id' | 'createdAt'>) => {
    try {
      await addVideoToCourseCard(cardId, video);
    } catch (error) {
      console.error('Error adding video to card:', error);
      throw error;
    }
  };

  const updateVideoHandler = async (videoId: string, updates: Partial<Video>) => {
    try {
      await updateVideo(videoId, updates);
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  };

  const deleteVideoHandler = async (videoId: string) => {
    try {
      await deleteVideo(videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

  const getVideoWithProgress = (videoId: string): Video | null => {
    // Find the video in course cards
    for (const card of courseCards) {
      const video = card.videos.find(v => v.id === videoId);
      if (video) {
        // Get user progress for this video
        const progress = userProgress.find(p => p.videoId === videoId);
        return {
          ...video,
          playsUsed: progress?.playsUsed || 0
        };
      }
    }
    return null;
  };

  const getCourseCardsBySubject = (subjectId: string): CourseCard[] => {
    return enrichedCourseCards.filter(card => card.subjectId === subjectId);
  };

  // Update course cards with user progress and purchase status
  const enrichedCourseCards = courseCards.map(card => ({
    ...card,
    isPurchased: card.isFree || userPurchases.includes(card.id), // Free cards are automatically "purchased"
    videos: card.videos.map(video => {
      const progress = userProgress.find(p => p.videoId === video.id);
      return {
        ...video,
        playsUsed: progress?.playsUsed || 0
      };
    })
  }));

  const value = {
    subjects,
    courseCards: enrichedCourseCards,
    userProgress,
    userPurchases,
    getCurrentMonthCard,
    purchaseCard,
    playVideo,
    
    // Subject management
    addSubject: addSubjectHandler,
    updateSubject: updateSubjectHandler,
    deleteSubject: deleteSubjectHandler,
    
    // Course card management
    addCourseCard: addCourseCardHandler,
    updateCourseCard: updateCourseCardHandler,
    deleteCourseCard: deleteCourseCardHandler,
    
    // Video management
    addVideoToCard,
    updateVideo: updateVideoHandler,
    deleteVideo: deleteVideoHandler,
    
    getVideoWithProgress,
    getCourseCardsBySubject,
    loading
  };

  return (
    <LMSContext.Provider value={value}>
      {children}
    </LMSContext.Provider>
  );
}