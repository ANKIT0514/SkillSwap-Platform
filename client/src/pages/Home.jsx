import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      
      {/* Floating blur elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 backdrop-blur-xl bg-white/40 border-b border-gray-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg" />
              <span className="text-xl font-semibold text-gray-900">SkillSwap</span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Dashboard
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="px-5 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/signup"
                      className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
                    >
                      Join Now
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div 
          className="text-center max-w-4xl mx-auto"
          initial="initial"
          animate="animate"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-7xl md:text-8xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
          >
            Learn skills.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Teach skills.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            A peer-to-peer platform where students exchange knowledge.
            Master new skills while teaching what you already know.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/dashboard"
                  className="inline-block px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-medium hover:bg-gray-800 transition shadow-lg"
                >
                  Go to Dashboard
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="inline-block px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-medium hover:bg-gray-800 transition shadow-lg"
                  >
                    Get Started
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="inline-block px-8 py-4 bg-white/60 backdrop-blur-xl text-gray-900 rounded-full text-lg font-medium border border-gray-200 hover:bg-white/80 transition shadow-lg"
                  >
                    Login
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="mt-32 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              title: "Learn from Peers",
              description: "Connect with students who have mastered the skills you want to learn"
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              ),
              title: "Fair Exchange",
              description: "Teach what you know in exchange for skills you want to learn"
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ),
              title: "Real-Time Chat",
              description: "Seamlessly coordinate learning sessions with built-in messaging"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="mt-32 bg-white/60 backdrop-blur-xl rounded-3xl p-12 border border-gray-200/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { number: "500+", label: "Active Students" },
              { number: "1,000+", label: "Skills Exchanged" },
              { number: "95%", label: "Success Rate" }
            ].map((stat, index) => (
              <div key={index}>
                <motion.h4 
                  className="text-5xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  {stat.number}
                </motion.h4>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="mt-32 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students exchanging skills today.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-gray-900 text-white rounded-full text-lg font-medium hover:bg-gray-800 transition shadow-lg"
            >
              Create Free Account
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-gray-200/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 SkillSwap. Built with ❤️ for students.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;