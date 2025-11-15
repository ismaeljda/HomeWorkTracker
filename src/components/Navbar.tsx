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
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-18 py-3">
          <Link to={getDashboardLink()} className="flex items-center space-x-3 group">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HomeworkTracker</h1>
              <p className="text-xs text-blue-100">Manage your assignments</p>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            {currentUser && userData && (
              <>
                <div className="hidden md:flex items-center space-x-3 bg-white bg-opacity-10 px-4 py-2 rounded-lg">
                  <div className="text-right">
                    <p className="font-semibold text-sm">{userData.name}</p>
                    <p className="text-xs text-blue-100">{userData.email}</p>
                  </div>
                  {getRoleBadge()}
                </div>

                <Link
                  to={getDashboardLink()}
                  className="hidden md:flex items-center space-x-2 bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg transition font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>My Homeworks</span>
                </Link>

                {userData.role === 'eleve' && (
                  <Link
                    to="/eleve/courses"
                    className="hidden md:flex items-center space-x-2 bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-lg transition font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>My Courses</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-medium shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
