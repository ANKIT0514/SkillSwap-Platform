import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import API from '../services/api';
import EditProfile from '../components/Profile/EditProfile';
import { getAvatarUrl } from '../utils/helpers'; 

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, logout, setUser: setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [swapData, setSwapData] = useState({
    fromSkill: '',
    toSkill: '',
    message: ''
  });

  useEffect(() => {
    fetchUser();
  }, [id]); // Re-fetch when ID changes

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/users/${id}`);
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSwapRequest = async (e) => {
    e.preventDefault();
    try {
      await API.post('/swaps', {
        to: id,
        fromSkill: swapData.fromSkill,
        toSkill: swapData.toSkill,
        message: swapData.message
      });
      alert('Swap request sent successfully!');
      setShowSwapModal(false);
      setSwapData({ fromSkill: '', toSkill: '', message: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send swap request');
    }
  };

  const handleStartChat = async () => {
    try {
      const { data } = await API.post('/chats', { userId: id });
      navigate('/messages', { state: { chatId: data.chat._id } });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
        {/* Navbar */}
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-20 backdrop-blur-xl bg-white/40 border-b border-gray-200/50"
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg" />
                <span className="text-xl font-semibold text-gray-900">SkillSwap</span>
              </Link>
              
              <div className="flex items-center space-x-1">
                <Link to="/dashboard" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                  Dashboard
                </Link>
                <Link to="/explore" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                  Explore
                </Link>
                <Link to="/swaps" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                  My Swaps
                </Link>
                <Link to="/messages" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                  Messages
                </Link>
                <Link to={`/profile/${currentUser?.id}`} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                  Profile
                </Link>
                <button onClick={logout} className="ml-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.nav>

        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">User not found</p>
            <Link to="/explore" className="text-indigo-600 hover:underline">
              Browse other students →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser.id === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
      {/* Background elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl" />

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 backdrop-blur-xl bg-white/40 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg" />
              <span className="text-xl font-semibold text-gray-900">SkillSwap</span>
            </Link>
            
            <div className="flex items-center space-x-1">
              <Link to="/dashboard" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link to="/explore" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Explore
              </Link>
              <Link to="/swaps" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                My Swaps
              </Link>
              <Link to="/messages" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Messages
              </Link>
              <Link 
                to={`/profile/${currentUser?.id}`} 
                className={`px-4 py-2 rounded-lg transition ${
                  isOwnProfile ? 'text-gray-900 font-medium bg-white/60' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                Profile
              </Link>
              <button onClick={logout} className="ml-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Profile Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50"
        >
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="w-24 h-24 rounded-full mr-6 ring-4 ring-gray-200 object-cover"
              />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                {user.college && (
                  <p className="text-gray-500 mt-1 flex items-center">
                    <span className="mr-2">🎓</span>
                    {user.college}
                  </p>
                )}
              </div>
            </div>
            
            {isOwnProfile ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditModal(true)}
                className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-800 transition"
              >
                Edit Profile
              </motion.button>
            ) : (
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSwapModal(true)}
                  className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-800 transition"
                >
                  Request Swap
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartChat}
                  className="bg-white/50 border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-xl font-medium hover:bg-white/80 transition"
                >
                  Message
                </motion.button>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed bg-white/50 p-4 rounded-xl">{user.bio}</p>
            </div>
          )}

          {/* Skills to Teach */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Can Teach</h2>
            {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.skillsToTeach.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 px-5 py-3 rounded-xl font-medium border border-green-200 shadow-sm"
                  >
                    {skill.skill} • {skill.level}
                  </motion.span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-white/50 p-4 rounded-xl">No skills added yet</p>
            )}
          </div>

          {/* Skills to Learn */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wants to Learn</h2>
            {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.skillsToLearn.map((skill, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 px-5 py-3 rounded-xl font-medium border border-blue-200 shadow-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-white/50 p-4 rounded-xl">No skills added yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-md w-full p-8 border border-gray-200/50 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Skill Swap</h2>
            <form onSubmit={handleSendSwapRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I can teach:
                </label>
                <input
                  type="text"
                  value={swapData.fromSkill}
                  onChange={(e) => setSwapData({ ...swapData, fromSkill: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to learn:
                </label>
                <input
                  type="text"
                  value={swapData.toSkill}
                  onChange={(e) => setSwapData({ ...swapData, toSkill: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., DSA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optional):
                </label>
                <textarea
                  value={swapData.message}
                  onChange={(e) => setSwapData({ ...swapData, message: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition"
                  placeholder="Introduce yourself..."
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition"
                >
                  Send Request
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSwapModal(false)}
                  className="flex-1 bg-white/50 border border-gray-300 py-3 rounded-xl font-medium hover:bg-white/80 transition"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedUser) => {
            setUser(updatedUser);
            // Update the current user in context if editing own profile
            if (isOwnProfile) {
              setCurrentUser(updatedUser);
            }
          }}
        />
      )}
    </div>
  );
};

export default Profile;