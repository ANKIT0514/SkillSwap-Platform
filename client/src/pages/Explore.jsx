import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import API from '../services/api';
import { getAvatarUrl } from '../utils/helpers';

const Explore = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users');
      setUsers(data.users.filter(u => u._id !== user.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let url = '/users?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (filterSkill) url += `skill=${filterSkill}`;
      
      const { data } = await API.get(url);
      setUsers(data.users.filter(u => u._id !== user.id));
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterSkill('');
    fetchUsers();
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
              <Link to="/explore" className="px-4 py-2 text-gray-900 font-medium rounded-lg hover:bg-white/60 transition">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Students</h1>
          <p className="text-gray-600 mb-8">Find the perfect learning partner</p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50"
        >
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            <input
              type="text"
              placeholder="Filter by skill..."
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
              >
                Search
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearFilters}
                className="px-6 py-3 bg-white/50 border border-gray-200 rounded-xl hover:bg-white/80 transition"
              >
                Clear
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Users Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center border border-gray-200/50"
          >
            <p className="text-gray-500 text-lg">No users found</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {users.map((u) => (
              <motion.div
                key={u._id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:border-gray-300/50 transition-all"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={getAvatarUrl(u.avatar)}
                    alt={u.name}
                    className="w-16 h-16 rounded-full mr-4 ring-2 ring-gray-200 group-hover:ring-indigo-400 transition"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{u.name}</h3>
                    <p className="text-sm text-gray-500">{u.college || 'No college'}</p>
                  </div>
                </div>

                {u.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{u.bio}</p>
                )}

                {/* Skills to Teach */}
                {u.skillsToTeach && u.skillsToTeach.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Can Teach:</p>
                    <div className="flex flex-wrap gap-2">
                      {u.skillsToTeach.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium"
                        >
                          {skill.skill}
                        </span>
                      ))}
                      {u.skillsToTeach.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{u.skillsToTeach.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills to Learn */}
                {u.skillsToLearn && u.skillsToLearn.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Wants to Learn:</p>
                    <div className="flex flex-wrap gap-2">
                      {u.skillsToLearn.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {u.skillsToLearn.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{u.skillsToLearn.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/profile/${u._id}`)}
                  className="w-full bg-gray-900 text-white py-2 rounded-xl font-medium hover:bg-gray-800 transition"
                >
                  View Profile
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Explore;