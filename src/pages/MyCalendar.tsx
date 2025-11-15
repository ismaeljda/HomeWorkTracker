import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentSubjects, getAllHomeworks, type Homework, type Subject } from '../firebase/firestore';
import { Link } from 'react-router-dom';

type ViewMode = 'month' | 'week';

const MyCalendar: React.FC = () => {
  const { userData } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Get type-specific colors with gradients and icons
  const getTypeColors = (type?: 'homework' | 'exam' | 'quiz') => {
    switch (type) {
      case 'exam':
        return { 
          gradient: 'from-red-500 to-pink-500', 
          bgLight: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: '📝',
          label: 'Exam'
        };
      case 'quiz':
        return { 
          gradient: 'from-purple-500 to-indigo-500',
          bgLight: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: '❓',
          label: 'Quiz'
        };
      default:
        return { 
          gradient: 'from-blue-500 to-cyan-500',
          bgLight: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: '📚',
          label: 'Homework'
        };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) return;

      try {
        setLoading(true);
        const subjectsData = await getStudentSubjects(userData.uid);
        setSubjects(subjectsData);

        // Fetch homeworks for all student subjects
        const allHomeworksData = [];
        for (const subject of subjectsData) {
          const subjectHomeworks = await getAllHomeworks({ subjectId: subject.id });
          allHomeworksData.push(...subjectHomeworks);
        }

        // Remove duplicates based on homework id
        const uniqueHomeworks = Array.from(
          new Map(allHomeworksData.map(hw => [hw.id, hw])).values()
        );

        setHomeworks(uniqueHomeworks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userData?.uid]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getHomeworksForDate = (date: Date) => {
    return homeworks.filter(hw => {
      const hwDate = hw.deadline.toDate();
      return hwDate.getDate() === date.getDate() &&
             hwDate.getMonth() === date.getMonth() &&
             hwDate.getFullYear() === date.getFullYear();
    });
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const changeWeek = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (delta * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600">Loading calendar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            My Calendar
          </h1>
          <p className="text-gray-600 text-lg">Track your homework deadlines and exams</p>
        </div>

        {/* Enhanced Controls */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('month')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  viewMode === 'month'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Month
                </span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  viewMode === 'week'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Week
                </span>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => viewMode === 'month' ? changeMonth(-1) : changeWeek(-1)}
                className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center min-w-[220px] px-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              </div>

              <button
                onClick={() => viewMode === 'month' ? changeMonth(1) : changeWeek(1)}
                className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Today Button */}
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Today
              </span>
            </button>
          </div>
        </div>

        {/* Enhanced Calendar Grid */}
        {viewMode === 'month' ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center font-bold text-gray-700 py-3 text-sm uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-3">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="min-h-[140px]" />;
                }

                const dayHomeworks = getHomeworksForDate(date);
                const today = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-[140px] rounded-2xl p-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      today
                        ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl ring-4 ring-purple-200'
                        : dayHomeworks.length > 0
                        ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-purple-300'
                        : 'bg-gray-50 border border-gray-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-lg font-bold mb-2 ${
                        today 
                          ? 'text-white' 
                          : dayHomeworks.length > 0 
                          ? 'text-gray-800' 
                          : 'text-gray-500'
                      }`}>
                        {date.getDate()}
                      </div>

                      <div className="space-y-1.5 overflow-hidden flex-1">
                        {dayHomeworks.slice(0, 3).map(hw => {
                          const colors = getTypeColors(hw.type);
                          return (
                            <Link
                              key={hw.id}
                              to={`/homework/${hw.id}`}
                              className={`block text-xs px-2 py-1.5 rounded-lg font-medium transition-all ${
                                today
                                  ? 'bg-white/25 hover:bg-white/40 text-white backdrop-blur-sm'
                                  : `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-md transform hover:scale-105`
                              }`}
                              title={hw.title}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-sm">{colors.icon}</span>
                                <span className="truncate text-xs">{hw.title}</span>
                              </span>
                            </Link>
                          );
                        })}
                        {dayHomeworks.length > 3 && (
                          <div className={`text-xs font-semibold px-2 pt-1 ${
                            today ? 'text-white' : 'text-purple-600'
                          }`}>
                            +{dayHomeworks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Enhanced Week View
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20">
            <div className="grid grid-cols-7 gap-4">
              {getWeekDays(currentDate).map((date, index) => {
                const dayHomeworks = getHomeworksForDate(date);
                const today = isToday(date);
                const hasHomework = dayHomeworks.length > 0;

                return (
                  <div key={index} className="flex flex-col">
                    {/* Enhanced Day Header with colors */}
                    <div className={`text-center p-5 rounded-t-2xl shadow-lg transition-all duration-300 ${
                      today
                        ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white scale-105'
                        : hasHomework
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                    }`}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                        {dayNames[date.getDay()]}
                      </div>
                      <div className="text-4xl font-extrabold">{date.getDate()}</div>
                      {today && (
                        <div className="text-xs mt-2 bg-white/25 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                          Today
                        </div>
                      )}
                      {!today && hasHomework && (
                        <div className="text-xs mt-2 bg-white/20 px-3 py-1 rounded-full inline-block">
                          {dayHomeworks.length} {dayHomeworks.length === 1 ? 'task' : 'tasks'}
                        </div>
                      )}
                    </div>

                    {/* Enhanced Homeworks List */}
                    <div className={`border-2 border-t-0 rounded-b-2xl p-3 min-h-[500px] transition-all overflow-y-auto ${
                      today
                        ? 'bg-gradient-to-b from-purple-50 to-pink-50 border-purple-200'
                        : hasHomework
                        ? 'bg-gradient-to-b from-indigo-50 to-purple-50 border-indigo-200'
                        : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'
                    }`}>
                      <div className="space-y-2">
                        {dayHomeworks.map(hw => {
                          const subject = subjects.find(s => s.id === hw.subjectId);
                          const colors = getTypeColors(hw.type);
                          return (
                            <Link
                              key={hw.id}
                              to={`/homework/${hw.id}`}
                              className={`block bg-white rounded-xl p-3 hover:shadow-lg transition-all duration-200 border-l-4 ${colors.border} hover:scale-[1.02]`}
                            >
                              {/* Header with icon and type */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{colors.icon}</span>
                                <span className={`text-xs font-bold ${colors.text} uppercase tracking-wide`}>
                                  {colors.label}
                                </span>
                              </div>
                              
                              {/* Title */}
                              <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">
                                {hw.title}
                              </h3>
                              
                              {/* Footer with subject and time */}
                              <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                                {subject && (
                                  <span className="truncate font-medium">
                                    📚 {subject.name}
                                  </span>
                                )}
                                <span className="flex-shrink-0 font-medium">
                                  ⏰ {hw.deadline.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCalendar;
