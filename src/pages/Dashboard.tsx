import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Clock, ShoppingCart, CheckCircle, ChevronDown, ChevronUp, Video, Gift, Folder, Star, TrendingUp, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLMS } from '../contexts/LMSContext';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { subjects, courseCards, getCurrentMonthCard, getCourseCardsBySubject, loading: lmsLoading } = useLMS();
  const navigate = useNavigate();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth state or loading LMS data
  if (authLoading || lmsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg font-medium">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentCard = getCurrentMonthCard();

  const toggleSubjectExpansion = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Calculate stats
  const totalCourses = courseCards.length;
  const purchasedCourses = courseCards.filter(card => card.isPurchased || card.isFree).length;
  const totalVideos = courseCards.reduce((acc, card) => acc + card.videos.length, 0);
  const watchedVideos = courseCards.reduce((acc, card) => 
    acc + card.videos.filter(video => video.playsUsed > 0).length, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome back, <span className="text-yellow-300">{user.name}</span>! 👋
              </h1>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                Continue your learning journey and unlock your potential with our premium courses
              </p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-400 p-2 rounded-xl">
                      <BookOpen className="w-5 h-5 text-yellow-800" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{purchasedCourses}</p>
                      <p className="text-sm text-blue-100">Enrolled Courses</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-400 p-2 rounded-xl">
                      <Video className="w-5 h-5 text-green-800" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{watchedVideos}</p>
                      <p className="text-sm text-blue-100">Videos Watched</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-400 p-2 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-purple-800" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{Math.round((watchedVideos / totalVideos) * 100) || 0}%</p>
                      <p className="text-sm text-blue-100">Progress</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-400 p-2 rounded-xl">
                      <Star className="w-5 h-5 text-orange-800" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{subjects.length}</p>
                      <p className="text-sm text-blue-100">Subjects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Current Month Card */}
        {currentCard && (currentCard.isPurchased || currentCard.isFree) && (
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-3 rounded-2xl">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Featured Course</h2>
                <p className="text-slate-600">Continue where you left off</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-2xl font-bold">{currentCard.name}</h3>
                      {currentCard.isFree && (
                        <div className="bg-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                          <Gift className="w-4 h-4" />
                          <span>Free</span>
                        </div>
                      )}
                    </div>
                    <p className="text-blue-100 mb-4">{currentCard.description || 'Premium course content'}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Video className="w-4 h-4" />
                        <span>{currentCard.videos.length} videos</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>{currentCard.isFree ? 'Free Access' : 'Premium'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentCard.videos.map((video) => {
                    const canPlay = video.playsUsed < video.maxPlays;
                    return (
                      <div key={video.id} className="group">
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300">
                          <div className="bg-gradient-to-br from-teal-500 to-blue-600 h-32 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                          
                          <h4 className="text-lg font-semibold text-slate-800 mb-2 break-words" title={video.title}>
                            {truncateText(video.title, 40)}
                          </h4>
                          <p className="text-slate-600 text-sm mb-4 break-words" title={video.description}>
                            {truncateText(video.description, 80)}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4 text-sm">
                            <div className="flex items-center space-x-1 text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>{video.duration}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              video.playsUsed >= video.maxPlays 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {video.playsUsed}/{video.maxPlays} plays
                            </span>
                          </div>
                          
                          <Link
                            to={`/video/${video.id}`}
                            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-center block ${
                              canPlay
                                ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                            onClick={(e) => !canPlay && e.preventDefault()}
                          >
                            {canPlay ? 'Watch Now' : 'No Plays Left'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Subjects and Course Cards */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">All Courses</h2>
              <p className="text-slate-600">Explore courses by subject</p>
            </div>
          </div>
          
          <div className="space-y-8">
            {subjects.map((subject) => {
              const subjectCourses = getCourseCardsBySubject(subject.id);
              if (subjectCourses.length === 0) return null;

              return (
                <div key={subject.id} className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                  <div 
                    className="p-8 cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 hover:from-slate-100 hover:to-slate-200 transition-all duration-200"
                    onClick={() => toggleSubjectExpansion(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl">
                          <Folder className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">{subject.name}</h3>
                          {subject.description && (
                            <p className="text-slate-600 mt-1">{subject.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {subjectCourses.length} courses
                        </div>
                        {expandedSubjects.has(subject.id) ? (
                          <ChevronUp className="w-6 h-6 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Cards for this subject */}
                  {expandedSubjects.has(subject.id) && (
                    <div className="p-8">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjectCourses.map((card) => (
                          <div key={card.id} className="group">
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                              <div 
                                className="p-6 cursor-pointer"
                                onClick={() => toggleCardExpansion(card.id)}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="text-xl font-bold text-slate-800 break-words" title={card.name}>
                                        {truncateText(card.name, 25)}
                                      </h4>
                                      {card.isFree && (
                                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                                          <Gift className="w-3 h-3" />
                                          <span>Free</span>
                                        </div>
                                      )}
                                    </div>
                                    {card.description && (
                                      <p className="text-slate-600 text-sm mb-3 break-words" title={card.description}>
                                        {truncateText(card.description, 60)}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                                      <div className="flex items-center space-x-1">
                                        <Video className="w-4 h-4" />
                                        <span>{card.videos.length} videos</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Users className="w-4 h-4" />
                                        <span>{card.isFree ? 'Free' : `LKR ${card.price.toLocaleString()}`}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    {(card.isPurchased || card.isFree) && (
                                      <div className="bg-green-100 p-2 rounded-full">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                      </div>
                                    )}
                                    {expandedCards.has(card.id) ? (
                                      <ChevronUp className="w-5 h-5 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-slate-400" />
                                    )}
                                  </div>
                                </div>
                                
                                {!card.isPurchased && !card.isFree && (
                                  <Link
                                    to="/purchase"
                                    state={{ cardId: card.id }}
                                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold text-center block shadow-lg hover:shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-center space-x-2">
                                      <ShoppingCart className="w-4 h-4" />
                                      <span>Purchase Course</span>
                                    </div>
                                  </Link>
                                )}
                              </div>

                              {/* Expanded Video List */}
                              {expandedCards.has(card.id) && (
                                <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                                  <div className="p-6">
                                    <h5 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
                                      <Video className="w-5 h-5 text-teal-600" />
                                      <span>Course Videos</span>
                                    </h5>
                                    <div className="space-y-3">
                                      {card.videos.map((video) => {
                                        const canAccess = card.isPurchased || card.isFree;
                                        const canPlay = video.playsUsed < video.maxPlays;
                                        
                                        return (
                                          <div 
                                            key={video.id} 
                                            className={`p-4 rounded-xl border transition-all duration-200 ${
                                              canAccess 
                                                ? 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-md' 
                                                : 'border-slate-200 bg-slate-50'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1 min-w-0">
                                                <h6 className="font-semibold text-slate-800 text-sm mb-1 break-words" title={video.title}>
                                                  {truncateText(video.title, 40)}
                                                </h6>
                                                <p className="text-xs text-slate-600 mb-3 break-words" title={video.description}>
                                                  {truncateText(video.description, 80)}
                                                </p>
                                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                                  <div className="flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{video.duration}</span>
                                                  </div>
                                                  {canAccess && (
                                                    <span className={`px-2 py-1 rounded-full font-medium ${
                                                      video.playsUsed >= video.maxPlays
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}>
                                                      {video.playsUsed}/{video.maxPlays} plays
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {canAccess ? (
                                                <Link
                                                  to={`/video/${video.id}`}
                                                  className={`ml-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                                    canPlay
                                                      ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                                                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                  }`}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!canPlay) e.preventDefault();
                                                  }}
                                                >
                                                  {canPlay ? 'Watch' : 'Used'}
                                                </Link>
                                              ) : (
                                                <div className="ml-3 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 text-slate-500">
                                                  Locked
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    
                                    {!card.isPurchased && !card.isFree && (
                                      <div className="mt-6 pt-4 border-t border-slate-200">
                                        <Link
                                          to="/purchase"
                                          state={{ cardId: card.id }}
                                          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold text-center block shadow-lg hover:shadow-xl"
                                        >
                                          Purchase to Access All Videos
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}