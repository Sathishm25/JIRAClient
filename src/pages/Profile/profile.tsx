import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_END_POINT } from '../../settings';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string; // Assuming role is optional
}

interface ProfileFormData {
  name: string;
  avatar?: string;
  avatarFile?: File; // Add file property for upload
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    avatar: undefined,
    avatarFile: undefined
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // Load user details from session storage
    const userDetails = sessionStorage.getItem('userdetails');
    if (userDetails) {
      try {
        const userData = JSON.parse(userDetails);
        setUser(userData);        
        setFormData({
          name: userData.name || '',
          avatar: '',
          avatarFile: undefined
        });
      } catch (error) {
        console.error('Error parsing user details:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };  const getAvatarImage = (user: Partial<User>, formDataAvatar?: string) => {
    if (formDataAvatar) {
       if (formDataAvatar.startsWith('/uploads/')) {
        return `${API_END_POINT}/${formDataAvatar}`;
      }
      return formDataAvatar;
    }
    if (user.avatar) {
      // Handle both relative URLs (from our API) and absolute URLs
      if (user.avatar.startsWith('/uploads/')) {
        return `${API_END_POINT}/${user.avatar}`;
      }
      return user.avatar;
    }    
    return "";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Store the file for upload and create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        avatarFile: file,
        avatar: previewUrl // Use for preview
      }));
    }
  };
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      let updatedUser: Partial<User> = { 
        name: formData.name,
      };

      // First, upload avatar if a new file was selected
      if (formData.avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', formData.avatarFile);

        const avatarRes = await axios.post(
          `${API_END_POINT}/api/users/${user?.id}/avatar`,
          avatarFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (avatarRes.status === 200) {
          updatedUser.avatar = avatarRes.data.avatarUrl;
        }
      }

      // Update user profile via API (name and other fields)
      const res = await axios.patch(
        `${API_END_POINT}/api/users/${user?.id}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
        
      if (res.status !== 200) {
        throw new Error('Failed to update profile');
      }
      
      // Clean up preview URL if it was created
      if (formData.avatar && formData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatar);
      }
      
      // Update session storage with new data
      sessionStorage.setItem('userdetails', JSON.stringify(res.data));
      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        avatar: res.data.avatar || '',
        avatarFile: undefined
      });      setIsEditing(false);
      
      // Show success message
      showToast('success', 'Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    // Clean up preview URL if it was created
    if (formData.avatar && formData.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(formData.avatar);
    }
    
    if (user) {      
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        avatarFile: undefined
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );  }  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url('/assets/pngtree-colorful-watercolor-splash-company-profile-image_730901.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-semibold transition-all duration-500 backdrop-blur-sm transform ${
            toast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } ${toast.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 border border-green-400' 
            : 'bg-gradient-to-r from-red-500 to-red-600 border border-red-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header with Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 group"
          >
            <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Cover Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center gap-6 mb-6 lg:mb-0">
              {/* Large Avatar */}
              <div className="w-24 h-24 relative">
                {(formData.avatar && isEditing) || getAvatarImage(user) ? (
                  <img 
                    src={getAvatarImage(user, formData.avatar)} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover border-4 border-white/20 shadow-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/20 shadow-xl">
                    {getInitials(user?.name || '')}
                  </div>
                )}
              </div>
              
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-blue-100 text-lg mb-1">{user.email}</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {user?.role || 'Member'}
                  </span>
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-green-200 text-sm">Online</span>
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#fff] text-white-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden h-full">
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Personal Information
                  </h2>
                </div>

                {/* Profile Picture and Details Layout */}
                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                  {/* Profile Picture Section - Left Side */}
                  <div className="flex-shrink-0">
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                        Profile Picture
                      </label>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 mb-4 relative group">
                          {(formData.avatar && isEditing) || getAvatarImage(user) ? (
                            <img 
                              src={getAvatarImage(user, formData.avatar)} 
                              alt={user.name}
                              className={`w-full h-full rounded-2xl object-cover border-4 border-white shadow-xl ${
                                isEditing ? 'cursor-pointer group-hover:scale-105 transition-transform duration-300' : ''
                              }`}
                              onClick={isEditing ? () => document.getElementById('avatar-upload')?.click() : undefined}
                            />
                          ) : (
                            <div 
                              className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl ${
                                isEditing ? 'cursor-pointer group-hover:scale-105 transition-transform duration-300' : ''
                              }`}
                              onClick={isEditing ? () => document.getElementById('avatar-upload')?.click() : undefined}
                            >
                              {getInitials(user?.name || '')}
                            </div>
                          )}
                          
                          {isEditing && (
                            <>
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                                   onClick={() => document.getElementById('avatar-upload')?.click()}>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-sm font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload New Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>                  {/* Details Section - Right Side */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{/* Name Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Full Name
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                            errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-lg font-medium text-slate-800">{user.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <p className="text-lg font-medium text-slate-800">{user.email}</p>
                    </div>
                  </div>

                  {/* User Role */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Role
                    </label>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-slate-800">{user?.role || 'Team Member'}</p>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Member Since
                    </label>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium text-slate-800">
                        {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Avatar and Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Activity Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Projects</p>
                      <p className="text-sm text-slate-600">Active projects</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">5</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Completed</p>
                      <p className="text-sm text-slate-600">Tasks finished</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">24</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">In Progress</p>
                      <p className="text-sm text-slate-600">Current tasks</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">7</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700">Create New Project</span>
                </button>

                <button className="w-full p-3 text-left bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-300 flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700">View All Issues</span>
                </button>

                <button className="w-full p-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-300 flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-700">Account Settings</span>
                </button>              </div>        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default Profile;