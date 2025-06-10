import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Clock, ShoppingCart, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Video, Gift, Folder } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Current Month Card Status */}
        {currentCard && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Month</h2>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentCard.name}
                    </h3>
                    {currentCard.isFree && (
                      <Gift className="w-5 h-5 text-green-500" title="Free Course" />
                    )}
                  </div>
                  <p className="text-gray-600">
                    {currentCard.isFree ? 'Free Course' : `LKR ${currentCard.price.toLocaleString()}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {currentCard.isPurchased || currentCard.isFree ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-600 font-medium">
                        {currentCard.isFree ? 'Free Access' : 'Purchased'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <span className="text-orange-600 font-medium">Not Purchased</span>
                    </>
                  )}
                </div>
              </div>
              
              {!currentCard.isPurchased && !currentCard.isFree && (
                <Link
                  to="/purchase"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Purchase Now</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Video Playlist for Current Month */}
        {currentCard && (currentCard.isPurchased || currentCard.isFree) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">This Month's Videos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCard.videos.map((video) => {
                const canPlay = video.playsUsed < video.maxPlays;
                return (
                  <div key={video.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-br from-teal-500 to-blue-600 h-48 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words" title={video.title}>
                        {truncateText(video.title, 40)}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 break-words" title={video.description}>
                        {truncateText(video.description, 80)}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{video.duration}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          video.playsUsed >= video.maxPlays 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {video.playsUsed}/{video.maxPlays} plays
                        </span>
                      </div>
                      
                      <Link
                        to={`/video/${video.id}`}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-center block ${
                          canPlay
                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={(e) => !canPlay && e.preventDefault()}
                      >
                        {canPlay ? 'Watch Video' : 'No Plays Left'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Subjects and Course Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Courses by Subject</h2>
          <div className="space-y-6">
            {subjects.map((subject) => {
              const subjectCourses = getCourseCardsBySubject(subject.id);
              if (subjectCourses.length === 0) return null;

              return (
                <div key={subject.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div 
                    className="p-6 cursor-pointer bg-gray-50 border-b border-gray-200"
                    onClick={() => toggleSubjectExpansion(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Folder className="w-6 h-6 text-teal-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                          {subject.description && (
                            <p className="text-sm text-gray-600">{subject.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                          {subjectCourses.length} courses
                        </span>
                        {expandedSubjects.has(subject.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Cards for this subject */}
                  {expandedSubjects.has(subject.id) && (
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjectCourses.map((card) => (
                          <div key={card.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div 
                              className="p-6 cursor-pointer"
                              onClick={() => toggleCardExpansion(card.id)}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="text-lg font-semibold text-gray-900 break-words" title={card.name}>
                                      {truncateText(card.name, 25)}
                                    </h4>
                                    {card.isFree && (
                                      <Gift className="w-4 h-4 text-green-500 flex-shrink-0" title="Free Course" />
                                    )}
                                  </div>
                                  {card.description && (
                                    <p className="text-sm text-gray-600 mb-2 break-words" title={card.description}>
                                      {truncateText(card.description, 60)}
                                    </p>
                                  )}
                                  <p className="text-gray-600">
                                    {card.isFree ? 'Free Course' : `LKR ${card.price.toLocaleString()}`}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  {(card.isPurchased || card.isFree) && (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                  )}
                                  {expandedCards.has(card.id) ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-4">
                                {card.videos.length} video{card.videos.length !== 1 ? 's' : ''}
                              </p>
                              
                              {!card.isPurchased && !card.isFree && (
                                <Link
                                  to="/purchase"
                                  state={{ cardId: card.id }}
                                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors text-sm inline-flex items-center space-x-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  <span>Purchase</span>
                                </Link>
                              )}
                            </div>

                            {/* Expanded Video List */}
                            {expandedCards.has(card.id) && (
                              <div className="border-t border-gray-100 bg-gray-50">
                                <div className="p-6">
                                  <h5 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <Video className="w-4 h-4" />
                                    <span>Course Videos</span>
                                  </h5>
                                  <div className="space-y-3">
                                    {card.videos.map((video) => {
                                      const canAccess = card.isPurchased || card.isFree;
                                      const canPlay = video.playsUsed < video.maxPlays;
                                      
                                      return (
                                        <div 
                                          key={video.id} 
                                          className={`p-4 rounded-lg border transition-colors ${
                                            canAccess 
                                              ? 'border-gray-200 bg-white hover:border-teal-300' 
                                              : 'border-gray-200 bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                              <h6 className="font-medium text-gray-900 text-sm mb-1 break-words" title={video.title}>
                                                {truncateText(video.title, 40)}
                                              </h6>
                                              <p className="text-xs text-gray-600 mb-2 break-words" title={video.description}>
                                                {truncateText(video.description, 80)}
                                              </p>
                                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                  <Clock className="w-3 h-3" />
                                                  <span>{video.duration}</span>
                                                </div>
                                                {canAccess && (
                                                  <span className={`px-2 py-1 rounded-full ${
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
                                                className={`ml-3 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                  canPlay
                                                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (!canPlay) e.preventDefault();
                                                }}
                                              >
                                                {canPlay ? 'Watch' : 'Used'}
                                              </Link>
                                            ) : (
                                              <div className="ml-3 px-3 py-1 rounded-lg text-xs font-medium bg-gray-200 text-gray-500">
                                                Locked
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  {!card.isPurchased && !card.isFree && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <Link
                                        to="/purchase"
                                        state={{ cardId: card.id }}
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium text-center block"
                                      >
                                        Purchase to Access All Videos
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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