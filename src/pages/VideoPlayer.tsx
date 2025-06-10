import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, AlertCircle, ExternalLink, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLMS } from '../contexts/LMSContext';

export default function VideoPlayer() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const { courseCards, playVideo } = useLMS();
  const navigate = useNavigate();
  const [video, setVideo] = useState<any>(null);
  const [courseCard, setCourseCard] = useState<any>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Find the video and its course card
    for (const card of courseCards) {
      const foundVideo = card.videos.find(v => v.id === videoId);
      if (foundVideo) {
        setVideo(foundVideo);
        setCourseCard(card);
        break;
      }
    }
  }, [user, videoId, courseCards, navigate]);

  const handlePlayVideo = () => {
    if (video && video.playsUsed < video.maxPlays && !hasPlayed) {
      playVideo(video.id);
      setHasPlayed(true);
      setShowVideo(true);
    }
  };

  if (!user || !video || !courseCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Video not found or access denied</p>
        </div>
      </div>
    );
  }

  if (!courseCard.isPurchased && !courseCard.isFree) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You need to purchase the {courseCard.month} {courseCard.year} course card to access this video.
          </p>
          <button
            onClick={() => navigate('/purchase')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Purchase Course
          </button>
        </div>
      </div>
    );
  }

  const canPlay = video.playsUsed < video.maxPlays;
  const currentPlays = video.playsUsed + (hasPlayed ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                {showVideo && video.youtubeId ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                ) : canPlay ? (
                  <div className="text-center">
                    <button
                      onClick={handlePlayVideo}
                      className="bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-full transition-colors mb-4"
                    >
                      <Play className="w-12 h-12" />
                    </button>
                    <p className="text-white text-lg font-medium mb-2">Click to play video</p>
                    <p className="text-gray-300 text-sm">
                      This will count as 1 play ({currentPlays + 1}/{video.maxPlays})
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-lg font-medium">No plays remaining</p>
                    <p className="text-gray-300">You've used all {video.maxPlays} plays for this video</p>
                  </div>
                )}
              </div>
            </div>

            {video.youtubeId && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-blue-700">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Watch on YouTube: 
                    <a 
                      href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 underline hover:text-blue-800"
                    >
                      {video.title}
                    </a>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {video.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {video.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Duration: {video.duration}</span>
                <span className={`px-3 py-1 rounded-full ${
                  canPlay 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {currentPlays}/{video.maxPlays} plays
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{courseCard.month} {courseCard.year}</span>
                    {courseCard.isFree && (
                      <Gift className="w-4 h-4 text-green-500" title="Free Course" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Videos:</span>
                  <span className="font-medium">{courseCard.videos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">
                    {courseCard.isFree ? 'Free Access' : 'Purchased'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
              <h4 className="font-semibold text-orange-800 mb-2">Important Notice</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Each video can be played maximum 3 times</li>
                <li>• Video downloading is disabled</li>
                <li>• Plays are tracked automatically</li>
                <li>• Access expires with course period</li>
              </ul>
            </div>

            {/* Other videos in this course */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Videos in This Course</h3>
              <div className="space-y-3">
                {courseCard.videos
                  .filter((v: any) => v.id !== video.id)
                  .map((otherVideo: any) => (
                    <button
                      key={otherVideo.id}
                      onClick={() => navigate(`/video/${otherVideo.id}`)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{otherVideo.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{otherVideo.duration}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          otherVideo.playsUsed >= otherVideo.maxPlays
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {otherVideo.playsUsed}/{otherVideo.maxPlays}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}