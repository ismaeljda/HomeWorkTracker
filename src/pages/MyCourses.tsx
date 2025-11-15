import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentSubjects, getTeacherSubjects, type Subject } from '../firebase/firestore';
import { getCourseColor } from '../utils/courseColors';

const MyCourses: React.FC = () => {
  const { userData } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!userData?.uid) return;
      try {
        setLoading(true);
        let data: Subject[] = [];
        if (userData.role === 'eleve') {
          data = await getStudentSubjects(userData.uid);
        } else if (userData.role === 'prof') {
          data = await getTeacherSubjects(userData.uid);
        }
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [userData?.uid, userData?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        {userData?.role === 'prof' ? 'My Teaching Courses' : 'My Courses'}
      </h1>

      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {subjects.map((subject) => {
            const colors = getCourseColor(subject.id);
            return (
              <div
                key={subject.id}
                onClick={() => navigate(`/course/${subject.id}`)}
                className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`bg-gradient-to-br ${colors.gradient} p-8 text-white`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className={`${colors.iconBg} ${colors.iconColor} p-4 rounded-xl`}>
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className={`${colors.badge} px-4 py-2 rounded-full text-sm font-bold`}>
                      Course
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">{subject.name}</h2>

                  <div className="flex items-center space-x-6 text-white opacity-90">
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span className="font-semibold text-lg">
                        {subject.studentIds.length} student{subject.studentIds.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 right-0 opacity-10">
                  <svg
                    className="w-32 h-32"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
