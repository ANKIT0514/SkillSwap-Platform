import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import API from '../services/api';
import AIRecommendations from '../components/AIMatchmaker/AIRecommendations';
import { getAvatarUrl } from '../utils/helpers';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSwaps: 0,
    pendingSwaps: 0,
    acceptedSwaps: 0,
    totalChats: 0
  });
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const swapsResponse = await API.get('/swaps');
      const swaps = swapsResponse.data.swapRequests;
      
      const chatsResponse = await API.get('/chats');
      const chats = chatsResponse.data.chats;

      setStats({
        totalSwaps: swaps.length,
        pendingSwaps: swaps.filter(s => s.status === 'pending').length,
        acceptedSwaps: swaps.filter(s => s.status === 'accepted').length,
        totalChats: chats.length
      });

      setRecentSwaps(swaps.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Subtle floating elements */}
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
              <Link to="/dashboard" className="px-4 py-2 text-gray-900 font-medium rounded-lg hover:bg-white/60 transition">
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
              <Link to={`/profile/${user?.id}`} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-white/60 hover:text-gray-900 transition">
                Profile
              </Link>
              <button
                onClick={logout}
                className="ml-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-xl"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-white/90 text-lg">
            Ready to exchange some skills today?
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Swaps', value: stats.totalSwaps, icon: '🤝', color: 'from-blue-500 to-cyan-500' },
                { label: 'Pending', value: stats.pendingSwaps, icon: '⏳', color: 'from-yellow-500 to-orange-500' },
                { label: 'Accepted', value: stats.acceptedSwaps, icon: '✅', color: 'from-green-500 to-emerald-500' },
                { label: 'Chats', value: stats.totalChats, icon: '💬', color: 'from-purple-500 to-pink-500' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 hover:border-gray-300/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  {[
                    { to: '/explore', icon: '🔍', title: 'Find Skills', desc: 'Browse students and their skills', color: 'hover:border-blue-300' },
                    { to: '/swaps', icon: '📋', title: 'Manage Swaps', desc: 'View and respond to requests', color: 'hover:border-green-300' },
                    { to: `/profile/${user?.id}`, icon: '👤', title: 'Edit Profile', desc: 'Update your skills and info', color: 'hover:border-purple-300' },
                  ].map((action, index) => (
                    <Link
                      key={index}
                      to={action.to}
                      className={`flex items-center p-4 bg-white/50 border-2 border-gray-200 rounded-xl ${action.color} transition-all group`}
                    >
                      <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">{action.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.desc}</p>
                      </div>
                    </Link>
                  ))}

                  <motion.button
                    onClick={() => setShowAIModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="text-3xl mr-4">✨</div>
                    <div className="text-left">
                      <h3 className="font-semibold">AI Matchmaker</h3>
                      <p className="text-sm text-white/90">Get intelligent skill match suggestions</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Swap Requests</h2>
                {recentSwaps.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No recent swaps</p>
                    <Link to="/explore" className="text-indigo-600 hover:underline mt-2 inline-block">
                      Start exploring →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSwaps.map((swap) => {
                      const isReceived = swap.to._id === user.id;
                      const otherUser = isReceived ? swap.from : swap.to;
                      
                      return (
                        <motion.div
                          key={swap._id}
                          whileHover={{ x: 4 }}
                          className="bg-white/50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <img
                                src={getAvatarUrl(otherUser.avatar)}
                                alt={otherUser.name}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <p className="font-medium text-gray-900">{otherUser.name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                              {swap.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 ml-13">
                            {swap.fromSkill} ⇄ {swap.toSkill}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Matchmaker Modal */}
      {showAIModal && (
        <AIRecommendations onClose={() => setShowAIModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;