'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ProfilePictureUploadProps {
  userId: string;
  currentPicture?: string | null;
  onUpdate?: (newPictureUrl: string | null) => void;
}

export default function ProfilePictureUpload({ userId, currentPicture, onUpdate }: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('userId', userId);

      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/users/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken || ''}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setPreview(result.data.profilePicture);
        onUpdate?.(result.data.profilePicture);
        alert('Profile picture updated successfully!');
      } else {
        alert(result.error || 'Failed to upload profile picture');
        setPreview(currentPicture || null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture');
      setPreview(currentPicture || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove the profile picture?')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken || ''}`,
        },
        body: JSON.stringify({
          profilePicture: null,
        }),
      });

      if (response.ok) {
        setPreview(null);
        onUpdate?.(null);
        alert('Profile picture removed successfully!');
      } else {
        alert('Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove profile picture');
    }
  };

  return (
    <div className="bg-[#2a2d3a] p-6 rounded-lg border border-[#404055]">
      <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
      
      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative">
          {preview ? (
            <Image
              src={preview}
              alt="Profile picture"
              width={80}
              height={80}
              className="rounded-full object-cover border-2 border-[#404055]"
            />
          ) : (
            <div className="w-20 h-20 bg-[#404055] rounded-full flex items-center justify-center border-2 border-[#404055]">
              <svg className="w-8 h-8 text-[#68D08B]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#68D08B] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#68D08B] text-white rounded-lg hover:bg-[#5bb77a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : preview ? 'Change Picture' : 'Upload Picture'}
          </button>
          
          {preview && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Remove Picture
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-sm text-[#a7a9b4] mt-3">
        Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.
      </p>
    </div>
  );
} 