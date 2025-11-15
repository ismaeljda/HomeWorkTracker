import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentSubjects, getUserById, getAllHomeworks, type Subject, updateHomework } from '../firebase/firestore';
import HomeworkCard from '../components/HomeworkCard';
import FilterBar from '../components/FilterBar';
import { filterHomeworks } from '../utils/helpers';

const DashboardEleve: React.FC = () => {
  const { userData } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allHomeworks, setAllHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('assigned');
  const [selectedType, setSelectedType] = useState('');

  const fetchData = async () => {
    if (!userData?.uid) return;
    try {
      setLoading(true);
      const studentSubjects = await getStudentSubjects(userData.uid);
      setSubjects(studentSubjects);

      // Fetch teacher names
      const teacherMap: {[key: string]: string} = {};
      for (const subject of studentSubjects) {
        if (subject.teacherId && !teacherMap[subject.teacherId]) {
          const teacher = await getUserById(subject.teacherId);
          if (teacher) {
            teacherMap[subject.teacherId] = teacher.name;
          }
        }
      }
      setTeachers(teacherMap);

      // Fetch homeworks for all student subjects
      const allHomeworksData = [];
      for (const subject of studentSubjects) {
        const subjectHomeworks = await getAllHomeworks({ subjectId: subject.id });
        allHomeworksData.push(...subjectHomeworks);
      }
      setAllHomeworks(allHomeworksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData?.uid]);

  const handleMarkComplete = async (id: string) => {
    try {
      const studentId = userData?.uid;
      if (!studentId) return;

      const homework = allHomeworks.find(hw => hw.id === id);
      if (homework) {
        const updatedCompletions = { ...homework.studentCompletions, [studentId]: true };
        await updateHomework(id, { studentCompletions: updatedCompletions });
        fetchData();
      }
    } catch (error) {
      console.error('Error marking homework as complete:', error);
    }
  };

  // Calculate statistics based on student-specific completions
  const homeworksWithStatus = allHomeworks.map(hw => ({
    ...hw,
    status: hw.studentCompletions?.[userData?.uid || ''] ? 'complete' : 'assigned'
  }));

  const incompleteHomeworks = homeworksWithStatus.filter(hw => hw.status !== 'complete');
  const totalIncomplete = incompleteHomeworks.length;
  const lateHomeworks = incompleteHomeworks.filter(hw => 
    hw.deadline.toDate() < new Date()
  ).length;

  // Sort by deadline (earliest first) and filter
  const filteredHomeworks = homeworksWithStatus
    .filter((hw) => !selectedSubject || hw.subjectId === selectedSubject)
    .filter((hw) => !selectedStatus || hw.status === selectedStatus)
    .filter((hw) => !selectedType || (hw.type || 'homework') === selectedType)
    .filter((hw) => filterHomeworks([hw], searchTerm).length > 0)
    .sort((a, b) => a.deadline.toMillis() - b.deadline.toMillis());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Homeworks</h1>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-90" />
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold mb-2 tracking-wide uppercase">To Complete</p>
                <p className="text-5xl font-extrabold text-white drop-shadow-lg">{totalIncomplete}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 shadow-xl">
                <svg className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-90" />
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold mb-2 tracking-wide uppercase">Overdue</p>
                <p className="text-5xl font-extrabold text-white drop-shadow-lg">{lateHomeworks}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 shadow-xl">
                <svg className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-90" />
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold mb-2 tracking-wide uppercase">Completed</p>
                <p className="text-5xl font-extrabold text-white drop-shadow-lg">{homeworksWithStatus.length - totalIncomplete}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 shadow-xl">
                <svg className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        subjects={subjects}
        showSubjectFilter
        showStatusFilter
        showTypeFilter
      />

      {filteredHomeworks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No homeworks found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredHomeworks.map((homework) => {
            const subject = subjects.find(s => s.id === homework.subjectId);
            const teacherName = subject ? teachers[subject.teacherId] : undefined;
            return (
              <HomeworkCard
                key={homework.id}
                homework={homework}
                onMarkComplete={handleMarkComplete}
                showActions
                role="eleve"
                teacherName={teacherName}
                subjectName={subject?.name}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardEleve;
