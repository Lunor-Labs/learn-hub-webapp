import { 
  createCourseCard, 
  addVideoToCourseCard,
  type CourseCard,
  type Video 
} from '../services/firestoreService';

// Sample data to seed the database
const sampleCourseCards = [
  {
    month: 'January',
    year: 2025,
    price: 2500,
    isPurchased: false,
    videos: []
  },
  {
    month: 'February',
    year: 2025,
    price: 2500,
    isPurchased: false,
    videos: []
  },
  {
    month: 'March',
    year: 2025,
    price: 2500,
    isPurchased: false,
    videos: []
  }
];

const sampleVideos = [
  // January videos
  {
    courseMonth: 'January',
    videos: [
      {
        title: 'Introduction to Web Development',
        description: 'Learn the fundamentals of HTML, CSS, and JavaScript. Perfect for beginners starting their web development journey.',
        youtubeId: 'UB1O30fR-EE',
        duration: '1:41:33',
        playsUsed: 0,
        maxPlays: 3
      },
      {
        title: 'Advanced React Concepts',
        description: 'Deep dive into React hooks, context API, and advanced patterns for building scalable applications.',
        youtubeId: 'f687hBjwFcM',
        duration: '2:25:39',
        playsUsed: 0,
        maxPlays: 3
      },
      {
        title: 'CSS Grid and Flexbox Mastery',
        description: 'Master modern CSS layout techniques with comprehensive examples and real-world projects.',
        youtubeId: 'rg7Fvvl3taU',
        duration: '1:11:21',
        playsUsed: 0,
        maxPlays: 3
      }
    ]
  },
  // February videos
  {
    courseMonth: 'February',
    videos: [
      {
        title: 'Node.js Fundamentals',
        description: 'Building server-side applications with Node.js, Express, and MongoDB for full-stack development.',
        youtubeId: 'TlB_eWDSMt4',
        duration: '8:16:48',
        playsUsed: 0,
        maxPlays: 3
      },
      {
        title: 'JavaScript ES6+ Features',
        description: 'Explore modern JavaScript features including arrow functions, destructuring, async/await, and modules.',
        youtubeId: 'NCwa_xi0Uuc',
        duration: '2:32:42',
        playsUsed: 0,
        maxPlays: 3
      },
      {
        title: 'Database Design Principles',
        description: 'Learn database design fundamentals, normalization, and best practices for data modeling.',
        youtubeId: 'ztHopE5Wnpc',
        duration: '1:16:44',
        playsUsed: 0,
        maxPlays: 3
      }
    ]
  },
  // March videos
  {
    courseMonth: 'March',
    videos: [
      {
        title: 'Python Programming Bootcamp',
        description: 'Complete Python programming course covering basics to advanced topics including data structures and algorithms.',
        youtubeId: '_uQrJ0TkZlc',
        duration: '6:14:07',
        playsUsed: 0,
        maxPlays: 3
      },
      {
        title: 'Git and GitHub Mastery',
        description: 'Version control with Git, collaborative development workflows, and GitHub best practices.',
        youtubeId: 'RGOj5yH7evk',
        duration: '1:08:13',
        playsUsed: 0,
        maxPlays: 3
      },
      {
        title: 'API Development with REST',
        description: 'Design and build RESTful APIs with proper authentication, validation, and documentation.',
        youtubeId: 'pKd0Rpw7O48',
        duration: '2:17:54',
        playsUsed: 0,
        maxPlays: 3
      }
    ]
  }
];

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create course cards and add videos
    for (let i = 0; i < sampleCourseCards.length; i++) {
      const courseCard = sampleCourseCards[i];
      const videoData = sampleVideos[i];
      
      console.log(`Creating course card for ${courseCard.month} ${courseCard.year}...`);
      
      // Create course card
      const cardId = await createCourseCard(courseCard);
      
      // Add videos to the course card
      for (const video of videoData.videos) {
        console.log(`Adding video: ${video.title}`);
        await addVideoToCourseCard(cardId, video);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Helper function to check if database needs seeding
export const checkAndSeedDatabase = async () => {
  try {
    // This would typically check if data already exists
    // For now, we'll just provide the seed function
    console.log('Database seeding function is available. Call seedDatabase() to populate with sample data.');
  } catch (error) {
    console.error('Error checking database:', error);
  }
};