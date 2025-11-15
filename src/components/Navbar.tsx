import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getDashboardLink = () => {
    if (!userData) return '/';
    switch (userData.role) {
      case 'admin':
        return '/admin';
      case 'prof':
        return '/prof';
      case 'eleve':
        return '/eleve';
      default:
        return '/';
    }
  };

  const getRoleBadge = () => {
    if (!userData) return null;
    const badges = {
      admin: { icon: '👑', color: 'bg-yellow-500', text: 'Admin' },
      prof: { icon: '👨‍🏫', color: 'bg-purple-500', text: 'Teacher' },
      eleve: { icon: '🎓', color: 'bg-green-500', text: 'Student' }
    };
    const badge = badges[userData.role];
    return (
      <span className={`${badge.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  return (
    <nav className="bg-gradient-to-r from-[#3B82F6] to-[#6366F1] text-white shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to={getDashboardLink()} className="flex items-center space-x-4 group">
            <div className="bg-white bg-opacity-20 p-3 rounded-2xl group-hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                HomeworkTracker
              </h1>
              <p className="text-sm text-white opacity-90 font-medium">Your Study Companion</p>
            </div>
          </Link>

          {/* Navigation Links & User Info */}
          <div className="flex items-center space-x-3">
            {currentUser && userData && (
              <>
                {/* Navigation Links */}
                <div className="hidden lg:flex items-center space-x-2">
                  {userData.role === 'eleve' && (
                    <>
                      <Link
                        to="/eleve"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 font-semibold backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>Homeworks</span>
                      </Link>
                      <Link
                        to="/eleve/courses"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 font-semibold backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        <span>Courses</span>
                      </Link>
                      <Link
                        to="/eleve/calendar"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 font-semibold backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>Calendar</span>
                      </Link>
                      <Link
                        to="/eleve/profile"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 font-semibold backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Profile</span>
                      </Link>
                    </>
                  )}
                  {userData.role === 'prof' && (
                    <>
                      <Link
                        to="/prof"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 font-semibold backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>Homeworks</span>
                      </Link>
                      <Link
                        to="/prof/courses"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 font-semibold backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                        <span>Courses</span>
                      </Link>
                      <Link
                        to="/prof/calendar"
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 font-semibold backdrop-blur-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>Calendar</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3 bg-white bg-opacity-20 px-5 py-2.5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <p className="font-bold text-base">{userData.name}</p>
                    {getRoleBadge()}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white text-[#374151] hover:bg-[#F3F4F6] px-5 py-2.5 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
