import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllHomeworks, getStudentSubjects, type Homework, type Subject } from '../firebase/firestore';

const Profile: React.FC = () => {
  const { userData } = useAuth();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) return;

      try {
        const [homeworksData, subjectsData] = await Promise.all([
          getAllHomeworks({ classId: userData.classId }),
          getStudentSubjects(userData.uid)
        ]);

        // Filter only exams and quizzes that have been submitted
        const assessments = homeworksData.filter(hw =>
          (hw.type === 'exam' || hw.type === 'quiz') &&
          hw.submissions &&
          hw.submissions[userData.uid]
        );

        setHomeworks(assessments);
        setSubjects(subjectsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userData?.uid, userData?.classId]);

  // Calculate statistics
  const totalAssessments = homeworks.length;
  const gradedAssessments = homeworks.filter(hw =>
    hw.submissions?.[userData?.uid || '']?.grade !== undefined
  );
  const totalPoints = gradedAssessments.reduce((sum, hw) =>
    sum + (hw.submissions?.[userData?.uid || '']?.grade || 0), 0
  );
  const maxPoints = gradedAssessments.reduce((sum, hw) =>
    sum + (hw.submissions?.[userData?.uid || '']?.maxGrade || 0), 0
  );
  const averagePercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3B82F6] to-[#6366F1] rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="bg-white bg-opacity-20 p-6 rounded-full backdrop-blur-sm">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{userData?.name}</h1>
              <p className="text-lg opacity-90">{userData?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                  🎓 Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Total Tests</h3>
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-gray-800">{totalAssessments}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Graded</h3>
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-gray-800">{gradedAssessments.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Total Points</h3>
              <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-gray-800">{totalPoints}/{maxPoints}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Average</h3>
              <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-gray-800">{averagePercentage}%</p>
          </div>
        </div>

        {/* Assessment History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Assessment History</h2>

          {homeworks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <p>No assessments completed yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {homeworks.map(hw => {
                const subject = subjects.find(s => s.id === hw.subjectId);
                const submission = hw.submissions?.[userData?.uid || ''];
                const isGraded = submission?.grade !== undefined;
                const percentage = submission?.maxGrade && submission?.grade !== undefined
                  ? Math.round((submission.grade / submission.maxGrade) * 100)
                  : 0;

                const getGradeColor = (pct: number) => {
                  if (pct >= 90) return 'text-green-600 bg-green-50';
                  if (pct >= 75) return 'text-blue-600 bg-blue-50';
                  if (pct >= 60) return 'text-yellow-600 bg-yellow-50';
                  return 'text-red-600 bg-red-50';
                };

                return (
                  <div key={hw.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            hw.type === 'exam' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {hw.type === 'exam' ? '📝 Exam' : '❓ Quiz'}
                          </span>
                          {subject && (
                            <span className="text-sm font-semibold text-gray-600">
                              {subject.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{hw.title}</h3>
                        <p className="text-sm text-gray-500">
                          Submitted: {submission?.submittedAt.toDate().toLocaleDateString()} at {submission?.submittedAt.toDate().toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="text-right ml-4">
                        {isGraded ? (
                          <>
                            <div className={`text-4xl font-bold mb-2 ${getGradeColor(percentage).split(' ')[0]}`}>
                              {percentage}%
                            </div>
                            <div className="text-sm text-gray-600 font-semibold">
                              {submission?.grade}/{submission?.maxGrade} points
                            </div>
                            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(percentage)}`}>
                              {percentage >= 90 ? 'Excellent' : percentage >= 75 ? 'Good' : percentage >= 60 ? 'Pass' : 'Needs Improvement'}
                            </div>
                          </>
                        ) : (
                          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg">
                            <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs font-semibold">Pending Grading</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Answer details if graded */}
                    {isGraded && hw.questions && hw.questions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Questions</p>
                            <p className="text-lg font-bold text-gray-800">{hw.questions.length}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Correct</p>
                            <p className="text-lg font-bold text-green-700">
                              {submission?.answers.filter(a => a.isCorrect).length || 0}
                            </p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Incorrect</p>
                            <p className="text-lg font-bold text-red-700">
                              {submission?.answers.filter(a => a.isCorrect === false).length || 0}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Duration</p>
                            <p className="text-lg font-bold text-blue-700">{hw.duration || 0} min</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
