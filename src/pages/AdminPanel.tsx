import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Settings, Users, BookOpen, Video, Edit, Trash2, Save, X, Gift, 
  FolderPlus, Folder, ChevronDown, ChevronRight, Eye, EyeOff 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLMS } from '../contexts/LMSContext';

export default function AdminPanel() {
  const { user } = useAuth();
  const { 
    subjects,
    courseCards, 
    addSubject,
    updateSubject,
    deleteSubject,
    addCourseCard, 
    updateCourseCard, 
    deleteCourseCard,
    addVideoToCard, 
    updateVideo, 
    deleteVideo,
    getCourseCardsBySubject
  } = useLMS();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('subjects');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: ''
  });

  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    price: 2500,
    isFree: false
  });

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    youtubeId: '',
    duration: ''
  });

  const [editSubjectForm, setEditSubjectForm] = useState({
    name: '',
    description: ''
  });

  const [editCourseForm, setEditCourseForm] = useState({
    name: '',
    description: '',
    price: 2500,
    isFree: false
  });

  const [editVideoForm, setEditVideoForm] = useState({
    title: '',
    description: '',
    youtubeId: '',
    duration: ''
  });

  if (!user || !user.isAdmin) {
    navigate('/dashboard');
    return null;
  }

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

  // Subject handlers
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSubject(subjectForm);
      setSubjectForm({ name: '', description: '' });
      setShowAddSubject(false);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject.id);
    setEditSubjectForm({
      name: subject.name,
      description: subject.description || ''
    });
  };

  const handleUpdateSubject = async (subjectId: string) => {
    try {
      await updateSubject(subjectId, editSubjectForm);
      setEditingSubject(null);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject? This will also delete all associated course cards, videos, and user progress.')) {
      try {
        await deleteSubject(subjectId);
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  // Course card handlers
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCourseCard({
        ...courseForm,
        subjectId: selectedSubjectId,
        isPurchased: false,
        videos: []
      });
      setCourseForm({ name: '', description: '', price: 2500, isFree: false });
      setShowAddCourse(false);
      setSelectedSubjectId('');
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleEditCourse = (card: any) => {
    setEditingCard(card.id);
    setEditCourseForm({
      name: card.name,
      description: card.description || '',
      price: card.price,
      isFree: card.isFree || false
    });
  };

  const handleUpdateCourse = async (cardId: string) => {
    try {
      await updateCourseCard(cardId, editCourseForm);
      setEditingCard(null);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this course card? This will also delete all associated videos and user progress.')) {
      try {
        await deleteCourseCard(cardId);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  // Video handlers
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCardId) {
      try {
        await addVideoToCard(selectedCardId, {
          ...videoForm,
          playsUsed: 0,
          maxPlays: 3
        });
        setVideoForm({ title: '', description: '', youtubeId: '', duration: '' });
        setShowAddVideo(false);
        setSelectedCardId('');
      } catch (error) {
        console.error('Error adding video:', error);
      }
    }
  };

  const handleEditVideo = (video: any) => {
    setEditingVideo(video.id);
    setEditVideoForm({
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId || '',
      duration: video.duration
    });
  };

  const handleUpdateVideo = async (videoId: string) => {
    try {
      await updateVideo(videoId, editVideoForm);
      setEditingVideo(null);
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video? This will also delete all user progress for this video.')) {
      try {
        await deleteVideo(videoId);
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Settings className="w-8 h-8" />
            <span>Admin Panel</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage subjects, courses, videos, and student access</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'subjects'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Folder className="w-5 h-5" />
                <span>Subject Management</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Analytics</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'subjects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Subjects & Course Management</h2>
                  <button
                    onClick={() => setShowAddSubject(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Add Subject</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 p-4">
                        {editingSubject === subject.id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                              <input
                                type="text"
                                value={editSubjectForm.name}
                                onChange={(e) => setEditSubjectForm({...editSubjectForm, name: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                value={editSubjectForm.description}
                                onChange={(e) => setEditSubjectForm({...editSubjectForm, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                rows={2}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateSubject(subject.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingSubject(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                              >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleSubjectExpansion(subject.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedSubjects.has(subject.id) ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </button>
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
                                {getCourseCardsBySubject(subject.id).length} courses
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedSubjectId(subject.id);
                                  setShowAddCourse(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Add Course"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditSubject(subject)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit Subject"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete Subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Course Cards for this subject */}
                      {expandedSubjects.has(subject.id) && (
                        <div className="p-4 bg-white">
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getCourseCardsBySubject(subject.id).map((card) => (
                              <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                                {editingCard === card.id ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                                      <input
                                        type="text"
                                        value={editCourseForm.name}
                                        onChange={(e) => setEditCourseForm({...editCourseForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                      <textarea
                                        value={editCourseForm.description}
                                        onChange={(e) => setEditCourseForm({...editCourseForm, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
                                      <input
                                        type="number"
                                        value={editCourseForm.price}
                                        onChange={(e) => setEditCourseForm({...editCourseForm, price: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        disabled={editCourseForm.isFree}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`edit-free-${card.id}`}
                                        checked={editCourseForm.isFree}
                                        onChange={(e) => setEditCourseForm({
                                          ...editCourseForm, 
                                          isFree: e.target.checked,
                                          price: e.target.checked ? 0 : 2500
                                        })}
                                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                      />
                                      <label htmlFor={`edit-free-${card.id}`} className="text-sm text-gray-700">
                                        Free Course
                                      </label>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleUpdateCourse(card.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center justify-center space-x-1"
                                      >
                                        <Save className="w-3 h-3" />
                                        <span>Save</span>
                                      </button>
                                      <button
                                        onClick={() => setEditingCard(null)}
                                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center space-x-1"
                                      >
                                        <X className="w-3 h-3" />
                                        <span>Cancel</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-semibold text-gray-900 text-sm break-words" title={card.name}>
                                            {truncateText(card.name, 30)}
                                          </h4>
                                          {card.isFree && (
                                            <Gift className="w-4 h-4 text-green-500 flex-shrink-0" title="Free Course" />
                                          )}
                                        </div>
                                        {card.description && (
                                          <p className="text-xs text-gray-600 mb-2 break-words" title={card.description}>
                                            {truncateText(card.description, 50)}
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-600">
                                          {card.isFree ? 'Free' : `LKR ${card.price.toLocaleString()}`}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-1 ml-2">
                                        <button
                                          onClick={() => toggleCardExpansion(card.id)}
                                          className="text-gray-500 hover:text-gray-700 p-1"
                                          title={expandedCards.has(card.id) ? "Hide Videos" : "Show Videos"}
                                        >
                                          {expandedCards.has(card.id) ? (
                                            <EyeOff className="w-3 h-3" />
                                          ) : (
                                            <Eye className="w-3 h-3" />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleEditCourse(card)}
                                          className="text-blue-600 hover:text-blue-800 p-1"
                                          title="Edit Course"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteCourse(card.id)}
                                          className="text-red-600 hover:text-red-800 p-1"
                                          title="Delete Course"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                        {card.videos.length} videos
                                      </span>
                                      <button
                                        onClick={() => {
                                          setSelectedCardId(card.id);
                                          setShowAddVideo(true);
                                        }}
                                        className="text-teal-600 hover:text-teal-800 flex items-center space-x-1"
                                        title="Add Video"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Video</span>
                                      </button>
                                    </div>

                                    {/* Videos list */}
                                    {expandedCards.has(card.id) && card.videos.length > 0 && (
                                      <div className="mt-3 space-y-2 border-t pt-3">
                                        {card.videos.map((video) => (
                                          <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                            {editingVideo === video.id ? (
                                              <div className="flex-1 space-y-2">
                                                <input
                                                  type="text"
                                                  value={editVideoForm.title}
                                                  onChange={(e) => setEditVideoForm({...editVideoForm, title: e.target.value})}
                                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                  placeholder="Video title"
                                                />
                                                <textarea
                                                  value={editVideoForm.description}
                                                  onChange={(e) => setEditVideoForm({...editVideoForm, description: e.target.value})}
                                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                  placeholder="Description"
                                                  rows={2}
                                                />
                                                <div className="flex space-x-2">
                                                  <input
                                                    type="text"
                                                    value={editVideoForm.youtubeId}
                                                    onChange={(e) => setEditVideoForm({...editVideoForm, youtubeId: e.target.value})}
                                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                    placeholder="YouTube ID"
                                                  />
                                                  <input
                                                    type="text"
                                                    value={editVideoForm.duration}
                                                    onChange={(e) => setEditVideoForm({...editVideoForm, duration: e.target.value})}
                                                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                    placeholder="Duration"
                                                  />
                                                </div>
                                                <div className="flex space-x-1">
                                                  <button
                                                    onClick={() => handleUpdateVideo(video.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                                                  >
                                                    <Save className="w-3 h-3" />
                                                    <span>Save</span>
                                                  </button>
                                                  <button
                                                    onClick={() => setEditingVideo(null)}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1"
                                                  >
                                                    <X className="w-3 h-3" />
                                                    <span>Cancel</span>
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                  <Video className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                                  <span className="text-gray-700 truncate" title={video.title}>
                                                    {truncateText(video.title, 25)}
                                                  </span>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                  <button
                                                    onClick={() => handleEditVideo(video)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="Edit Video"
                                                  >
                                                    <Edit className="w-3 h-3" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteVideo(video.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="Delete Video"
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Analytics</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-teal-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-teal-800">Total Subjects</h3>
                    <p className="text-3xl font-bold text-teal-600">{subjects.length}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-blue-800">Total Courses</h3>
                    <p className="text-3xl font-bold text-blue-600">{courseCards.length}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-purple-800">Total Videos</h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {courseCards.reduce((acc, card) => acc + card.videos.length, 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="font-semibold text-green-800">Free Courses</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {courseCards.filter(card => card.isFree).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Subject Modal */}
        {showAddSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Subject</h3>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                  <input
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Mathematics, Science, Programming"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    placeholder="Brief description of the subject"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    Add Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Course Modal */}
        {showAddCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Course</h3>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                  <input
                    type="text"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Math - June 2025, Physics Bootcamp"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    placeholder="Brief description of the course"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (LKR)</label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({...courseForm, price: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                    disabled={courseForm.isFree}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={courseForm.isFree}
                    onChange={(e) => setCourseForm({
                      ...courseForm, 
                      isFree: e.target.checked,
                      price: e.target.checked ? 0 : 2500
                    })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="isFree" className="text-sm text-gray-700 flex items-center space-x-1">
                    <Gift className="w-4 h-4 text-green-500" />
                    <span>Make this course free</span>
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    Add Course
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCourse(false);
                      setSelectedSubjectId('');
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Video Modal */}
        {showAddVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Video</h3>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube ID</label>
                  <input
                    type="text"
                    value={videoForm.youtubeId}
                    onChange={(e) => setVideoForm({...videoForm, youtubeId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="dQw4w9WgXcQ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({...videoForm, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="45:32"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddVideo(false);
                      setSelectedCardId('');
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}