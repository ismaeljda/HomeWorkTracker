import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentSubjects, getTeacherSubjects, getAllHomeworks, type Homework, type Subject, type CourseSchedule } from '../firebase/firestore';
import { Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

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
        let subjectsData: Subject[] = [];
        
        if (userData.role === 'eleve') {
          subjectsData = await getStudentSubjects(userData.uid);
        } else if (userData.role === 'prof') {
          subjectsData = await getTeacherSubjects(userData.uid);
        }
        
        setSubjects(subjectsData);

        // Fetch homeworks for all subjects
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
  }, [userData?.uid, userData?.role]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startingDayOfWeek = firstDay.getDay();
    
    // Adjust so Monday = 0, Sunday = 6
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

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
    // Get Monday as start of week
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, else go to Monday
    startOfWeek.setDate(date.getDate() + diff);

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

  const getScheduleForDay = (dayOfWeek: number) => {
    const schedules: (CourseSchedule & { subject: Subject })[] = [];
    
    // Adjust dayOfWeek: Monday = 1, Sunday = 0 => Monday = 1, Sunday = 7
    const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    subjects.forEach(subject => {
      if (subject.schedule) {
        subject.schedule.forEach(schedule => {
          if (schedule.dayOfWeek === adjustedDayOfWeek) {
            schedules.push({ ...schedule, subject });
          }
        });
      }
    });
    
    // Sort by start time
    return schedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const cancelCourse = async (subjectId: string, scheduleId: string, date: Date) => {
    if (userData?.role !== 'prof') return;
    
    try {
      const dateStr = date.toISOString().split('T')[0];
      const subjectRef = doc(db, 'subjects', subjectId);
      
      // Update the schedule to mark it as cancelled for this specific date
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject || !subject.schedule) return;
      
      const updatedSchedule = subject.schedule.map(sch => {
        if (sch.id === scheduleId || sch.startTime === scheduleId) {
          return {
            ...sch,
            cancelledDate: dateStr,
            isCancelled: true
          };
        }
        return sch;
      });
      
      await updateDoc(subjectRef, { schedule: updatedSchedule });
      
      // Refresh data
      const subjectsData = await getTeacherSubjects(userData.uid);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error cancelling course:', error);
    }
  };

  const isCourseCancelled = (schedule: CourseSchedule, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedule.cancelledDate === dateStr && schedule.isCancelled;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 pb-1 leading-tight">
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
          // Enhanced Week View with Timeline
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {/* Time Column */}
              <div className="flex-shrink-0 w-20 border-r-2 border-gray-200">
                <div className="h-16 border-b-2 border-gray-200"></div>
                {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
                  <div key={hour} className="h-16 border-b border-gray-200 flex items-start pt-1 pr-2 justify-end">
                    <span className="text-xs font-semibold text-gray-600">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* Days Columns */}
              {getWeekDays(currentDate).map((date, index) => {
                const dayHomeworks = getHomeworksForDate(date);
                const today = isToday(date);
                const dayOfWeek = date.getDay();
                const daySchedule = getScheduleForDay(dayOfWeek);

                return (
                  <div
                    key={index}
                    className={`flex-1 min-w-[180px] border-r-2 border-gray-200 last:border-r-0 ${
                      today ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Day Header */}
                    <div className={`h-16 border-b-2 border-gray-200 p-2 text-center sticky top-0 z-10 ${
                      today 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'bg-gray-50'
                    }`}>
                      <div className={`text-xs font-bold uppercase ${today ? 'text-white' : 'text-gray-600'}`}>
                        {dayNames[index]}
                      </div>
                      <div className={`text-2xl font-extrabold ${today ? 'text-white' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>
                    </div>

                    {/* Timeline Grid */}
                    <div className="relative" style={{ height: '640px' }}>
                      {/* Hour Grid Lines */}
                      {Array.from({ length: 10 }, (_, i) => i).map(hour => (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 h-16 border-b border-gray-200"
                          style={{ top: `${hour * 64}px` }}
                        />
                      ))}

                      {/* Course Schedule Items */}
                      {daySchedule.map((schedule, idx) => {
                        const cancelled = isCourseCancelled(schedule, date);
                        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
                        const [endHour, endMin] = schedule.endTime.split(':').map(Number);
                        
                        // Calculate position (8am = 0, 9am = 64px, etc.)
                        const startMinutes = (startHour - 8) * 60 + startMin;
                        const endMinutes = (endHour - 8) * 60 + endMin;
                        const top = (startMinutes / 60) * 64;
                        const height = ((endMinutes - startMinutes) / 60) * 64;

                        // Skip if outside 8-18 range
                        if (startHour < 8 || endHour > 18) return null;

                        return (
                          <div
                            key={idx}
                            className={`absolute left-0 right-0 p-3 text-xs transition-all overflow-hidden ${
                              cancelled
                                ? 'bg-gray-200 opacity-60'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                            }`}
                            style={{ 
                              top: `${top}px`, 
                              height: `${height}px`,
                              minHeight: '50px'
                            }}
                          >
                            {cancelled && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-500/90 backdrop-blur-sm">
                                <span className="text-white px-2 py-1 text-xs font-bold uppercase tracking-wide">
                                  Cancelled
                                </span>
                              </div>
                            )}
                            <div className={cancelled ? 'opacity-40' : ''}>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="font-bold leading-tight truncate text-sm">{schedule.subject.name}</span>
                                {userData?.role === 'prof' && !cancelled && (
                                  <button
                                    onClick={() => cancelCourse(schedule.subjectId, schedule.id || schedule.startTime, date)}
                                    className="text-white/80 hover:text-red-300 flex-shrink-0 transition-colors"
                                    title="Cancel this class"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mb-1 opacity-90">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-medium">
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                              </div>
                              {schedule.room && (
                                <div className="flex items-center gap-1.5 opacity-80">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="text-xs truncate">
                                    {schedule.room}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tasks Due Section - Below Timeline */}
                    <div className="border-t-2 border-gray-200 bg-gray-50 p-3 min-h-[180px]">
                      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Tasks Due ({dayHomeworks.length})
                      </h3>
                      {dayHomeworks.length === 0 ? (
                        <p className="text-gray-400 text-xs text-center py-4">No tasks due</p>
                      ) : (
                        <div className="space-y-2 max-h-36 overflow-y-auto">
                          {dayHomeworks.map(hw => {
                            const colors = getTypeColors(hw.type);
                            return (
                              <Link
                                key={hw.id}
                                to={`/homework/${hw.id}`}
                                className="block rounded-lg px-3 py-2 text-xs bg-white border-l-4 shadow-sm hover:shadow-md transition-all"
                                style={{ borderColor: colors.text.replace('text-', '#').replace('-700', '') }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-gray-900 truncate">
                                      {hw.title}
                                    </div>
                                    <div className={`text-[10px] ${colors.text} font-semibold uppercase tracking-wide mt-0.5`}>
                                      {colors.label}
                                    </div>
                                  </div>
                                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
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
