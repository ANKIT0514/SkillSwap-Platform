import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import API from '../services/api';
import { getAvatarUrl } from '../utils/helpers';

const MySwaps = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSwaps();
  }, [activeTab]);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      let url = '/swaps';
      if (activeTab === 'sent') url += '?type=sent';
      if (activeTab === 'received') url += '?type=received';
      
      const { data } = await API.get(url);
      setSwaps(data.swapRequests);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (swapId, status) => {
    try {
      await API.put(`/swaps/${swapId}`, { status });
      alert(`Swap request ${status}!`);
      fetchSwaps();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update swap request');
    }
  };

  const handleDelete = async (swapId) => {
    if (!window.confirm('Are you sure you want to delete this swap request?')) return;
    
    try {
      await API.delete(`/swaps/${swapId}`);
      fetchSwaps();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete swap request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

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
              <Link to="/swaps" className="px-4 py-2 text-gray-900 font-medium rounded-lg hover:bg-white/60 transition">
                My Swaps
              </Link>
              <Link to="/messages" className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Messages
              </Link>
              <Link to={`/profile/${user?.id}`} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Profile
              </Link>
              <button onClick={logout} className="ml-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Swap Requests</h1>
          <p className="text-gray-600 mb-8">Manage your skill exchange requests</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg mb-6 border border-gray-200/50"
        >
          <div className="flex">
            {['all', 'sent', 'received'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-center font-medium transition rounded-2xl ${
                  activeTab === tab
                    ? 'text-gray-900 bg-white/80'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                }`}
              >
                {tab === 'all' ? 'All Requests' : tab === 'sent' ? 'Sent' : 'Received'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Swaps List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : swaps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center border border-gray-200/50"
          >
            <p className="text-gray-500 text-lg mb-4">No swap requests found</p>
            <Link
              to="/explore"
              className="inline-block bg-gray-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Explore Students
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {swaps.map((swap) => {
              const isReceived = swap.to._id === user.id;
              const otherUser = isReceived ? swap.from : swap.to;

              return (
                <motion.div
                  key={swap._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:border-gray-300/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <img
                        src={getAvatarUrl(otherUser.avatar)}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full mr-4 ring-2 ring-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 mr-3">
                            {otherUser.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(swap.status)}`}>
                            {swap.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {otherUser.email} • {otherUser.college || 'No college'}
                        </p>
                        <div className="bg-white/50 rounded-xl p-4 mb-3 border border-gray-200">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                {isReceived ? 'They can teach:' : 'You can teach:'}
                              </p>
                              <p className="font-medium text-gray-900">{swap.fromSkill}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                {isReceived ? 'They want to learn:' : 'You want to learn:'}
                              </p>
                              <p className="font-medium text-gray-900">{swap.toSkill}</p>
                            </div>
                          </div>
                          {swap.message && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600 italic">"{swap.message}"</p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(swap.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/profile/${otherUser._id}`)}
                        className="px-4 py-2 bg-white/50 border border-gray-300 rounded-xl text-sm font-medium hover:bg-white/80 transition"
                      >
                        View Profile
                      </motion.button>
                      
                      {isReceived && swap.status === 'pending' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(swap._id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
                          >
                            Accept
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(swap._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
                          >
                            Reject
                          </motion.button>
                        </>
                      )}

                      {!isReceived && swap.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(swap._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
                        >
                          Cancel
                        </motion.button>
                      )}

                      {swap.status === 'accepted' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateStatus(swap._id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Mark Complete
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MySwaps;