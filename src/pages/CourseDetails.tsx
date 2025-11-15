import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDoc, doc, getDocs, collection, query, where, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Subject, User, Announcement } from '../firebase/firestore';
import { getCourseColor } from '../utils/courseColors';

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Subject | null>(null);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        setLoading(true);

        // Fetch course details
        const courseDoc = await getDoc(doc(db, 'subjects', courseId));
        if (!courseDoc.exists()) {
          console.error('Course not found');
          return;
        }

        const courseData = { id: courseDoc.id, ...courseDoc.data() } as Subject;
        setCourse(courseData);

        // Fetch teacher details
        const teacherDoc = await getDoc(doc(db, 'users', courseData.teacherId));
        if (teacherDoc.exists()) {
          setTeacher({ uid: teacherDoc.id, ...teacherDoc.data() } as User);
        }

        // Fetch all students in this course
        if (courseData.studentIds && courseData.studentIds.length > 0) {
          const studentsQuery = query(
            collection(db, 'users'),
            where('__name__', 'in', courseData.studentIds)
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          const studentsData = studentsSnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
          } as User));
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const getCoursesLink = () => {
    if (userData?.role === 'prof') {
      return '/prof/courses';
    } else if (userData?.role === 'eleve') {
      return '/eleve/courses';
    }
    return '/courses';
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.trim() || !courseId || !userData) return;

    try {
      setIsAddingAnnouncement(true);
      const announcement: Announcement = {
        id: Date.now().toString(),
        message: newAnnouncement.trim(),
        createdAt: Timestamp.now(),
        createdBy: userData.uid
      };

      await updateDoc(doc(db, 'subjects', courseId), {
        announcements: arrayUnion(announcement)
      });

      // Update local state
      setCourse(prev => prev ? {
        ...prev,
        announcements: [...(prev.announcements || []), announcement]
      } : null);

      setNewAnnouncement('');
    } catch (error) {
      console.error('Error adding announcement:', error);
      alert('Failed to add announcement');
    } finally {
      setIsAddingAnnouncement(false);
    }
  };

  const formatAnnouncementDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-700">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 mb-4">Course not found</p>
          <button
            onClick={() => navigate(getCoursesLink())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const colors = course ? getCourseColor(course.id) : getCourseColor('default');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(getCoursesLink())}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        <div className={`${colors.header} rounded-2xl shadow-xl p-8 text-white`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold">{course.name}</h1>
              <p className="text-white/90 text-lg mt-2">Course Details</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xl font-semibold">{students.length} students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2`}>
          <svg className={`w-7 h-7 ${colors.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Announcements
        </h2>

        {/* Add announcement (professors only) */}
        {userData?.role === 'prof' && userData.uid === course?.teacherId && (
          <div className={`mb-6 ${colors.iconBg} rounded-lg p-4 border-2 ${colors.iconColor.replace('text-', 'border-')}`}>
            <textarea
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Write an announcement for your students..."
              className={`w-full p-3 border-2 ${colors.iconColor.replace('text-', 'border-')} rounded-lg focus:outline-none focus:ring-2 focus:ring-${colors.accentColor}-500 resize-none`}
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddAnnouncement}
                disabled={!newAnnouncement.trim() || isAddingAnnouncement}
                className={`${colors.iconColor.replace('text-', 'bg-').replace('-600', '-500')} hover:${colors.iconColor.replace('text-', 'bg-').replace('-600', '-600')} disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
              >
                {isAddingAnnouncement ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        )}

        {/* Announcements list */}
        {!course?.announcements || course.announcements.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 font-medium">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...(course.announcements || [])].reverse().map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-gradient-to-r ${colors.iconBg} to-${colors.accentColor}-50 border-l-4 ${colors.iconColor.replace('text-', 'border-')} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${colors.iconColor.replace('text-', 'bg-').replace('-600', '-500')} rounded-full p-2 flex-shrink-0`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium leading-relaxed">{announcement.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatAnnouncementDate(announcement.createdAt)}</span>
                      <span className="text-gray-400">•</span>
                      <span className={`font-semibold ${colors.iconColor}`}>{teacher?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teacher Information */}
      {teacher && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
          <h2 className={`text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2`}>
            <svg className={`w-7 h-7 ${colors.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Teacher
          </h2>
          <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
            <div className={`${colors.iconBg} ${colors.iconColor} rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl`}>
              {teacher.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900">{teacher.name}</p>
              <p className="text-gray-600">{teacher.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className={`text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2`}>
          <svg className={`w-7 h-7 ${colors.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Students ({students.length})
        </h2>

        {students.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No students enrolled yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student, index) => (
              <div
                key={student.uid}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all duration-200 border border-gray-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`${colors.iconBg} ${colors.iconColor} rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">{student.name}</p>
                    <p className="text-sm text-gray-600 truncate">{student.email}</p>
                  </div>
                  <div className="text-gray-400 font-semibold text-sm">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
