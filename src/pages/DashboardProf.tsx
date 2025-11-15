import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHomeworks } from '../hooks/useHomeworks';
import {
  getAllClasses,
  getTeacherSubjects,
  type Class,
  type Subject,
  addHomework,
  updateHomework,
  deleteHomework,
  uploadFile
} from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import HomeworkCard from '../components/HomeworkCard';
import FilterBar from '../components/FilterBar';
import { filterHomeworks } from '../utils/helpers';

interface SubjectWithClass extends Subject {
  className?: string;
}

const DashboardProf: React.FC = () => {
  const { userData } = useAuth();
  const { homeworks, loading, refetch } = useHomeworks({
    teacherId: userData?.uid
  });

  const [activeTab, setActiveTab] = useState<'homeworks' | 'classes'>('homeworks');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithClass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classId: '',
    description: '',
    deadline: '',
    file: null as File | null
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.uid) return;
      try {
        const [classesData, teacherSubjectsData] = await Promise.all([
          getAllClasses(),
          getTeacherSubjects(userData.uid)
        ]);

        // Add class names to subjects for display
        const subjectsWithClass = teacherSubjectsData.map(subject => {
          const className = classesData.find(c => c.id === subject.classId)?.name || '';
          return {
            ...subject,
            className
          };
        });

        setClasses(classesData);
        setSubjects(subjectsWithClass);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [userData?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let fileUrl = '';

      if (formData.file) {
        const filePath = `homeworks/${Date.now()}_${formData.file.name}`;
        fileUrl = await uploadFile(formData.file, filePath);
      }

      // Get student IDs from selected subject
      const selectedSubject = subjects.find(s => s.id === formData.subjectId);
      const studentCompletions: { [studentId: string]: boolean } = {};

      if (selectedSubject?.studentIds) {
        selectedSubject.studentIds.forEach(studentId => {
          studentCompletions[studentId] = false;
        });
      }

      const homeworkData = {
        title: formData.title,
        subjectId: formData.subjectId,
        teacherId: userData?.uid || '',
        classId: formData.classId,
        description: formData.description,
        deadline: Timestamp.fromDate(new Date(formData.deadline)),
        status: 'assigned' as const,
        studentCompletions,
        fileUrl
      };

      if (editingId) {
        await updateHomework(editingId, homeworkData);
      } else {
        await addHomework(homeworkData);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        subjectId: '',
        classId: '',
        description: '',
        deadline: '',
        file: null
      });
      refetch();
    } catch (error) {
      console.error('Error saving homework:', error);
    }
  };

  const handleEdit = (id: string) => {
    const homework = homeworks.find((hw) => hw.id === id);
    if (homework) {
      setEditingId(id);
      setFormData({
        title: homework.title,
        subjectId: homework.subjectId,
        classId: homework.classId,
        description: homework.description,
        deadline: homework.deadline.toDate().toISOString().slice(0, 16),
        file: null
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this homework?')) {
      try {
        await deleteHomework(id);
        refetch();
      } catch (error) {
        console.error('Error deleting homework:', error);
      }
    }
  };

  const filteredHomeworks = homeworks
    .filter((hw) => !selectedSubject || hw.subjectId === selectedSubject)
    .filter((hw) => filterHomeworks([hw], searchTerm).length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const colorSchemes = [
    { gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', badge: 'bg-blue-200 text-blue-800' },
    { gradient: 'from-purple-500 to-pink-600', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', badge: 'bg-purple-200 text-purple-800' },
    { gradient: 'from-green-500 to-teal-600', iconBg: 'bg-green-100', iconColor: 'text-green-600', badge: 'bg-green-200 text-green-800' },
    { gradient: 'from-orange-500 to-red-600', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', badge: 'bg-orange-200 text-orange-800' },
    { gradient: 'from-cyan-500 to-blue-600', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', badge: 'bg-cyan-200 text-cyan-800' },
    { gradient: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', badge: 'bg-rose-200 text-rose-800' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Teacher Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 bg-white rounded-lg shadow-md p-2">
        <button
          onClick={() => setActiveTab('homeworks')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'homeworks'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📚 My Homeworks
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'classes'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎓 My Classes
        </button>
      </div>

      {/* Homeworks Tab */}
      {activeTab === 'homeworks' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700">Manage Homeworks</h2>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  title: '',
                  subjectId: '',
                  classId: '',
                  description: '',
                  deadline: '',
                  file: null
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              {showForm ? 'Cancel' : 'Add New Homework'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Edit Homework' : 'Add New Homework'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => {
                  const selectedSubject = subjects.find(s => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    subjectId: e.target.value,
                    classId: selectedSubject?.classId || ''
                  });
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} - {subject.className}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (optional)
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    file: e.target.files ? e.target.files[0] : null
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                {editingId ? 'Update' : 'Create'} Homework
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
          )}

          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            subjects={subjects}
            showSubjectFilter
          />

          {filteredHomeworks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No homeworks found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHomeworks.map((homework) => (
                <HomeworkCard
                  key={homework.id}
                  homework={homework}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showActions
                  role="prof"
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <>
          <h2 className="text-2xl font-bold text-gray-700 mb-6">My Classes</h2>

          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No classes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {subjects.map((subject, index) => {
                const colors = colorSchemes[index % colorSchemes.length];
                return (
                  <div
                    key={subject.id}
                    className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
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
                          {subject.className}
                        </div>
                      </div>

                      <h3 className="text-3xl font-bold mb-4">{subject.name}</h3>

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
        </>
      )}
    </div>
  );
};

export default DashboardProf;
