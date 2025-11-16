import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import type { CallBackProps } from 'react-joyride';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTutorial } from '../context/TutorialContext';
import { getStudentSubjects, getUserById, getAllHomeworks, type Subject, updateHomework } from '../firebase/firestore';
import HomeworkCard from '../components/HomeworkCard';
import FilterBar from '../components/FilterBar';
import { filterHomeworks } from '../utils/helpers';
import { studentTutorialSteps, joyrideStyles, joyrideLocale } from '../utils/tutorialSteps';

const DashboardEleve: React.FC = () => {
  const { userData } = useAuth();
  const { runTutorial, stopTutorial, setTutorialStep } = useTutorial();
  const navigate = useNavigate();
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
    const confirmed = window.confirm('Are you sure you want to mark this assignment as complete?');
    if (!confirmed) return;

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

  // Group homeworks by time period
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const dueToday = filteredHomeworks.filter(hw => {
    const deadline = hw.deadline.toDate();
    return deadline >= today && deadline < tomorrow;
  });

  const dueTomorrow = filteredHomeworks.filter(hw => {
    const deadline = hw.deadline.toDate();
    return deadline >= tomorrow && deadline < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
  });

  const dueThisWeek = filteredHomeworks.filter(hw => {
    const deadline = hw.deadline.toDate();
    const dayAfterTomorrow = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
    return deadline >= dayAfterTomorrow && deadline <= endOfWeek;
  });

  const dueThisMonth = filteredHomeworks.filter(hw => {
    const deadline = hw.deadline.toDate();
    return deadline > endOfWeek && deadline <= endOfMonth;
  });

  const dueLater = filteredHomeworks.filter(hw => {
    const deadline = hw.deadline.toDate();
    return deadline > endOfMonth;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action } = data;

    // If moving from step 6 (index 6) to step 7 (index 7) and there's a homework available
    if (index === 6 && action === 'next' && filteredHomeworks.length > 0) {
      // Save tutorial progress and navigate to the first homework detail page
      const firstHomework = filteredHomeworks[0];
      setTutorialStep(7);
      navigate(`/homework/${firstHomework.id}`);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      stopTutorial();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tutorial */}
      <Joyride
        steps={studentTutorialSteps}
        run={runTutorial}
        continuous
        showProgress
        showSkipButton
        locale={joyrideLocale}
        styles={joyrideStyles}
        callback={handleJoyrideCallback}
      />

      {/* Statistics Section - Separate Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">My Homeworks</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stats-cards">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-700 text-base font-semibold uppercase tracking-wider mb-3">To Complete</p>
                <p className="text-5xl font-bold text-blue-900">{totalIncomplete}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 hover:border-indigo-300">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-indigo-700 text-base font-semibold uppercase tracking-wider mb-3">Overdue</p>
                <p className="text-5xl font-bold text-indigo-900">{lateHomeworks}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100 border-2 border-sky-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 hover:border-sky-300">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-sky-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sky-700 text-base font-semibold uppercase tracking-wider mb-3">Completed</p>
                <p className="text-5xl font-bold text-sky-900">{homeworksWithStatus.length - totalIncomplete}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 py-8">

      <div className="filter-bar">
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
      </div>

      {filteredHomeworks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No homeworks found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {dueToday.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Due Today</h2>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  {dueToday.length} {dueToday.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {dueToday.map((homework) => {
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
            </div>
          )}

          {dueTomorrow.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Due Tomorrow</h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  {dueTomorrow.length} {dueTomorrow.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {dueTomorrow.map((homework) => {
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
            </div>
          )}

          {dueThisWeek.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Due This Week</h2>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                  {dueThisWeek.length} {dueThisWeek.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {dueThisWeek.map((homework) => {
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
            </div>
          )}

          {dueThisMonth.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Due This Month</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {dueThisMonth.length} {dueThisMonth.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {dueThisMonth.map((homework) => {
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
            </div>
          )}

          {dueLater.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Due Later</h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                  {dueLater.length} {dueLater.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              <div className="flex flex-col gap-6">
                {dueLater.map((homework) => {
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
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default DashboardEleve;
