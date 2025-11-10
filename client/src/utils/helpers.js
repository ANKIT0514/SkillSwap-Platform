export const getAvatarUrl = (avatar) => {
  if (!avatar) return 'https://via.placeholder.com/150';
  if (avatar.startsWith('http')) return avatar;
  return `http://localhost:5000${avatar}`;
};