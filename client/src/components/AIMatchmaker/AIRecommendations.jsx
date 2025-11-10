import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const AIRecommendations = ({ onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const navigate = useNavigate();

  const getRecommendations = async () => {
    try {
      setLoading(true);
      const endpoint = useAI ? '/ai/recommendations' : '/ai/simple-recommendations';
      const { data } = await API.post(endpoint);
      setRecommendations(data.recommendations);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">AI Skill Matcher ✨</h2>
            <p className="text-gray-600">Find your perfect learning partners</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* AI Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                {useAI ? '✨ AI-Powered Matching' : '📊 Simple Matching'}
              </p>
              <p className="text-sm text-blue-700">
                {useAI 
                  ? 'Get intelligent recommendations based on compatibility' 
                  : 'Get basic skill-based matches'}
              </p>
            </div>
            <button
              onClick={() => setUseAI(!useAI)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Switch to {useAI ? 'Simple' : 'AI'}
            </button>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Click below to get personalized recommendations
            </p>
            <button
              onClick={getRecommendations}
              disabled={loading}
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </span>
              ) : (
                `Get ${useAI ? 'AI' : 'Simple'} Recommendations`
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Top {recommendations.length} Matches
              </h3>
              <button
                onClick={getRecommendations}
                disabled={loading}
                className="text-primary hover:underline text-sm"
              >
                Refresh
              </button>
            </div>

            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold text-lg mr-4">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <img
                          src={rec.user?.avatar || 'https://via.placeholder.com/150'}
                          alt={rec.user?.name || rec.name}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800">
                            {rec.user?.name || rec.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {rec.user?.college || 'No college'}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className={`text-3xl font-bold ${getScoreColor(rec.score)}`}>
                            {rec.score}%
                          </span>
                          <p className="text-xs text-gray-500 text-right">Match</p>
                        </div>
                      </div>

                      <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">💡 Why this match: </span>
                          {rec.reason}
                        </p>
                      </div>

                      {rec.user && (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Can Teach:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.user.skillsToTeach?.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {skill.skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Wants to Learn:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.user.skillsToLearn?.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/profile/${rec.user._id}`);
                    }}
                    className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/profile/${rec.user._id}`);
                    }}
                    className="flex-1 border border-primary text-primary py-2 rounded-lg font-medium hover:bg-primary/5 transition"
                  >
                    Send Swap Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;