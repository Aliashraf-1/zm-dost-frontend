// lib/imageHelper.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

// ✅ Cloudinary cloud name
const CLOUDINARY_CLOUD_NAME = 'feugmspe';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // ✅ Case 1: Already full URL (Cloudinary ka seedha URL)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // ✅ Case 2: Relative Cloudinary path (e.g., "bms/employees/xyz.jpg")
  if (imagePath.startsWith('bms/')) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${imagePath}`;
  }

  // ✅ Case 3: Mixed old+new path (e.g., "uploads/employees/bms/employees/xyz.jpg")
  // → "bms/" ke baad wala hissa nikaal ke Cloudinary URL banao
  if (imagePath.includes('bms/')) {
    const bmsIndex = imagePath.indexOf('bms/');
    const cloudinaryPath = imagePath.substring(bmsIndex);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${cloudinaryPath}`;
  }

  // ✅ Case 4: Legacy local path with /uploads/ (fallback)
  if (imagePath.startsWith('/uploads/')) {
    return `${BASE_URL}${imagePath}`;
  }

  // ✅ Case 5: Legacy local path without slash
  if (imagePath.startsWith('uploads/')) {
    return `${BASE_URL}/${imagePath}`;
  }

  // ✅ Case 6: Just a filename (legacy)
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