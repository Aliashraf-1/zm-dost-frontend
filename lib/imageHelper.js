// lib/imageHelper.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // ✅ If already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // ✅ If path starts with /uploads/ (with slash)
  if (imagePath.startsWith('/uploads/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // ✅ If path starts with uploads/ (without slash)
  if (imagePath.startsWith('uploads/')) {
    return `${BASE_URL}/${imagePath}`;
  }
  
  // ✅ If path is just a filename
  if (!imagePath.startsWith('/')) {
    return `${BASE_URL}/uploads/${imagePath}`;
  }
  
  return imagePath;
};

export const getFallbackImage = (type = 'unit') => {
  const fallbacks = {
    unit: 'https://placehold.co/800x400/1e293b/94a3b8?text=No+Image',
    tenant: 'https://placehold.co/100x100/1e293b/94a3b8?text=User',
    building: 'https://placehold.co/200x200/1e293b/94a3b8?text=Building',
    employee: 'https://placehold.co/100x100/6366f1/ffffff?text=User',
  };
  return fallbacks[type] || fallbacks.unit;
};