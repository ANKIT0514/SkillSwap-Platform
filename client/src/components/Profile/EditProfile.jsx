import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import API from '../../services/api';
import ImageCropModal from './ImageCropModal';
import { getAvatarUrl } from '../../utils/helpers';

const EditProfile = ({ onClose, onUpdate }) => {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    college: user.college || '',
  });
  const [skillToTeach, setSkillToTeach] = useState({ skill: '', level: 'Intermediate' });
  const [skillToLearn, setSkillToLearn] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Please select a JPG or PNG image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    try {
      setUploadingImage(true);
      setShowCropModal(false);

      const formData = new FormData();
      formData.append('avatar', croppedBlob, 'avatar.jpg');

      const { data } = await API.post(`/users/${user.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedUser = { ...data.user, id: data.user._id || data.user.id };
      setUser(updatedUser);
      onUpdate(updatedUser);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      setImageSrc(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.put(`/users/${user.id}`, formData);
      
      const updatedUser = { ...data.user, id: data.user._id || data.user.id };
      setUser(updatedUser);
      onUpdate(updatedUser);
    } catch (error) {
      console.error('Update error:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkillToTeach = async (e) => {
    e.preventDefault();
    if (!skillToTeach.skill.trim()) return;

    try {
      const { data } = await API.post(`/users/${user.id}/skills/teach`, skillToTeach);
      const updatedUser = { ...data.user, id: data.user._id || data.user.id };
      setUser(updatedUser);
      onUpdate(updatedUser);
      setSkillToTeach({ skill: '', level: 'Intermediate' });
    } catch (error) {
      console.error('Add skill error:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkillToTeach = async (skillId) => {
    try {
      const { data } = await API.delete(`/users/${user.id}/skills/teach/${skillId}`);
      const updatedUser = { ...data.user, id: data.user._id || data.user.id };
      setUser(updatedUser);
      onUpdate(updatedUser);
    } catch (error) {
      console.error('Remove skill error:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to remove skill');
    }
  };

  const handleAddSkillToLearn = async (e) => {
    e.preventDefault();
    if (!skillToLearn.trim()) return;

    try {
      const { data } = await API.post(`/users/${user.id}/skills/learn`, {
        skill: skillToLearn
      });
      const updatedUser = { ...data.user, id: data.user._id || data.user.id };
      setUser(updatedUser);
      onUpdate(updatedUser);
      setSkillToLearn('');
    } catch (error) {
      console.error('Add skill error:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkillToLearn = async (index) => {
    try {
      const { data } = await API.delete(`/users/${user.id}/skills/learn/${index}`);
      const updatedUser = { ...data.user, id: data.user._id || data.user.id };
      setUser(updatedUser);
      onUpdate(updatedUser);
    } catch (error) {
      console.error('Remove skill error:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to remove skill');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-2xl w-full p-8 my-8 border border-gray-200/50 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            >
              ×
            </button>
          </div>

          {/* Profile Photo Upload */}
          <div className="mb-8 text-center">
            <div className="inline-block relative">
              <img
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="w-32 h-32 rounded-full ring-4 ring-gray-200 object-cover"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 bg-gray-900 text-white p-3 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {uploadingImage ? 'Uploading...' : 'Click camera icon to upload photo (JPG or PNG)'}
            </p>
          </div>

          {/* Basic Info */}
          <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </motion.button>
          </form>

          {/* Current Skills to Teach */}
          {user.skillsToTeach && user.skillsToTeach.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Current Skills You Can Teach:</h3>
              <div className="flex flex-wrap gap-2">
                {user.skillsToTeach.map((skill, idx) => (
                  <div
                    key={skill._id || idx}
                    className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm"
                  >
                    <span className="mr-2">{skill.skill} • {skill.level}</span>
                    <button
                      onClick={() => handleRemoveSkillToTeach(skill._id)}
                      className="text-green-600 hover:text-green-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Skill to Teach */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Add Skill to Teach</h3>
            <form onSubmit={handleAddSkillToTeach} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={skillToTeach.skill}
                  onChange={(e) => setSkillToTeach({ ...skillToTeach, skill: e.target.value })}
                  placeholder="Skill name (e.g., React)"
                  className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
                <select
                  value={skillToTeach.level}
                  onChange={(e) => setSkillToTeach({ ...skillToTeach, level: e.target.value })}
                  className="px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Add Skill to Teach
              </motion.button>
            </form>
          </div>

          {/* Current Skills to Learn */}
          {user.skillsToLearn && user.skillsToLearn.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Current Skills You Want to Learn:</h3>
              <div className="flex flex-wrap gap-2">
                {user.skillsToLearn.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm"
                  >
                    <span className="mr-2">{skill}</span>
                    <button
                      onClick={() => handleRemoveSkillToLearn(idx)}
                      className="text-blue-600 hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Skill to Learn */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Add Skill to Learn</h3>
            <form onSubmit={handleAddSkillToLearn} className="space-y-3">
              <input
                type="text"
                value={skillToLearn}
                onChange={(e) => setSkillToLearn(e.target.value)}
                placeholder="Skill name (e.g., Data Structures)"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
              >
                Add Skill to Learn
              </motion.button>
            </form>
          </div>

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Close
          </motion.button>
        </motion.div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && imageSrc && (
        <ImageCropModal
          image={imageSrc}
          onClose={() => {
            setShowCropModal(false);
            setImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default EditProfile;