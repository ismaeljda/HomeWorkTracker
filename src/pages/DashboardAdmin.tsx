import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  getAllClasses,
  getAllSubjects,
  type Class,
  type Subject,
  type User,
  type CourseSchedule,
  addClass,
  updateClass,
  deleteClass,
  addSubject,
  updateSubject,
  deleteSubject
} from '../firebase/firestore';

type ActiveTab = 'classes' | 'subjects' | 'users' | 'schedules';

const DashboardAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);

  const [showClassForm, setShowClassForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const [classFormData, setClassFormData] = useState({
    name: ''
  });

  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    classId: '',
    teacherId: '',
    studentIds: [] as string[]
  });

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'eleve' as 'admin' | 'prof' | 'eleve',
    classId: '',
    subjectIds: [] as string[]
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    subjectId: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    room: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesData, subjectsData] = await Promise.all([
        getAllClasses(),
        getAllSubjects()
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: User[] = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
      setTeachers(usersData.filter(u => u.role === 'prof'));
      setStudents(usersData.filter(u => u.role === 'eleve'));

      // Fetch schedules
      const schedulesSnapshot = await getDocs(collection(db, 'schedules'));
      const schedulesData: CourseSchedule[] = [];
      schedulesSnapshot.forEach((doc) => {
        schedulesData.push({ id: doc.id, ...doc.data() } as CourseSchedule);
      });
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Classes Management
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClassId) {
        await updateClass(editingClassId, classFormData);
      } else {
        await addClass(classFormData);
      }
      setShowClassForm(false);
      setEditingClassId(null);
      setClassFormData({ name: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handleEditClass = (cls: Class) => {
    setEditingClassId(cls.id);
    setClassFormData({ name: cls.name });
    setShowClassForm(true);
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteClass(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  // Subjects Management
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubjectId) {
        await updateSubject(editingSubjectId, subjectFormData);
      } else {
        await addSubject(subjectFormData);
      }
      setShowSubjectForm(false);
      setEditingSubjectId(null);
      setSubjectFormData({ name: '', classId: '', teacherId: '', studentIds: [] });
      fetchData();
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectFormData({
      name: subject.name,
      classId: subject.classId || '',
      teacherId: subject.teacherId || '',
      studentIds: subject.studentIds || []
    });
    setShowSubjectForm(true);
  };

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSubjectFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  // Users Management
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        classId: userFormData.classId,
        ...(userFormData.role === 'eleve' && { subjectIds: userFormData.subjectIds })
      };

      if (editingUserId) {
        await updateDoc(doc(db, 'users', editingUserId), userData);
      } else {
        // For creating new users, you'd need Firebase Auth integration
        alert('Creating new users requires Firebase Auth setup. Please use the signup page.');
        return;
      }

      setShowUserForm(false);
      setEditingUserId(null);
      setUserFormData({ name: '', email: '', role: 'eleve', classId: '', subjectIds: [] });
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.uid);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      classId: user.classId || '',
      subjectIds: user.subjectIds || []
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleUserSubject = (subjectId: string) => {
    setUserFormData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }));
  };

  // Schedules Management
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScheduleId) {
        await updateDoc(doc(db, 'schedules', editingScheduleId), scheduleFormData);
      } else {
        await addDoc(collection(db, 'schedules'), scheduleFormData);
      }
      setShowScheduleForm(false);
      setEditingScheduleId(null);
      setScheduleFormData({ subjectId: '', dayOfWeek: 1, startTime: '08:00', endTime: '09:00', room: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEditSchedule = (schedule: CourseSchedule) => {
    setEditingScheduleId(schedule.id || null);
    setScheduleFormData({
      subjectId: schedule.subjectId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room || ''
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteDoc(doc(db, 'schedules', id));
        fetchData();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'classes'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-b-4 hover:border-blue-200'
            }`}
          >
            📚 Classes
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'subjects'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-b-4 hover:border-blue-200'
            }`}
          >
            📖 Subjects
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'users'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-b-4 hover:border-blue-200'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-3 font-semibold transition-all ${
              activeTab === 'schedules'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:border-b-4 hover:border-blue-200'
            }`}
          >
            🕐 Schedules
          </button>
        </nav>
      </div>

      {/* CLASSES TAB */}
      {activeTab === 'classes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Manage Classes</h2>
            <button
              onClick={() => {
                setShowClassForm(!showClassForm);
                setEditingClassId(null);
                setClassFormData({ name: '' });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold shadow-md hover:shadow-lg"
            >
              {showClassForm ? '✕ Cancel' : '+ Add New Class'}
            </button>
          </div>

          {showClassForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-blue-600">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                {editingClassId ? 'Edit Class' : 'Add New Class'}
              </h3>
              <form onSubmit={handleClassSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={classFormData.name}
                    onChange={(e) =>
                      setClassFormData({ ...classFormData, name: e.target.value })
                    }
                    placeholder="e.g., 6A, Terminale S"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    {editingClassId ? 'Update' : 'Create'} Class
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowClassForm(false);
                      setEditingClassId(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                      No classes found. Create your first class!
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {cls.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-4">
                        <button
                          onClick={() => handleEditClass(cls)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Manage Subjects</h2>
            <button
              onClick={() => {
                setShowSubjectForm(!showSubjectForm);
                setEditingSubjectId(null);
                setSubjectFormData({ name: '', classId: '', teacherId: '', studentIds: [] });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold shadow-md hover:shadow-lg"
            >
              {showSubjectForm ? '✕ Cancel' : '+ Add New Subject'}
            </button>
          </div>

          {showSubjectForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-blue-600">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                {editingSubjectId ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <form onSubmit={handleSubjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={subjectFormData.name}
                    onChange={(e) =>
                      setSubjectFormData({ ...subjectFormData, name: e.target.value })
                    }
                    placeholder="e.g., Mathematics, French, History"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    value={subjectFormData.classId}
                    onChange={(e) =>
                      setSubjectFormData({ ...subjectFormData, classId: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Teacher
                  </label>
                  <select
                    value={subjectFormData.teacherId}
                    onChange={(e) =>
                      setSubjectFormData({ ...subjectFormData, teacherId: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.uid} value={teacher.uid}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign Students
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {students.filter(s => s.classId === subjectFormData.classId).length === 0 ? (
                      <p className="text-gray-500 text-sm">No students in this class yet</p>
                    ) : (
                      students
                        .filter(s => s.classId === subjectFormData.classId)
                        .map((student) => (
                          <div key={student.uid} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`student-${student.uid}`}
                              checked={subjectFormData.studentIds.includes(student.uid)}
                              onChange={() => handleToggleStudent(student.uid)}
                              className="mr-2 w-4 h-4 text-blue-600"
                            />
                            <label htmlFor={`student-${student.uid}`} className="text-gray-700">
                              {student.name} ({student.email})
                            </label>
                          </div>
                        ))
                    )}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    {editingSubjectId ? 'Update' : 'Create'} Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubjectForm(false);
                      setEditingSubjectId(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No subjects found. Create your first subject!
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => {
                    const subjectClass = classes.find(c => c.id === subject.classId);
                    const teacher = teachers.find(t => t.uid === subject.teacherId);
                    return (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {subject.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {subjectClass?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {teacher?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {subject.studentIds?.length || 0} students
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-4">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Manage Users</h2>
            <p className="text-sm text-gray-600">
              ℹ️ New users must sign up via the signup page. You can edit existing users here.
            </p>
          </div>

          {showUserForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-blue-600">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Edit User
              </h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, email: e.target.value })
                    }
                    required
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, role: e.target.value as 'admin' | 'prof' | 'eleve' })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="eleve">Student</option>
                    <option value="prof">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    value={userFormData.classId}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, classId: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                {userFormData.role === 'eleve' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign Subjects
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {subjects.filter(s => s.classId === userFormData.classId).length === 0 ? (
                        <p className="text-gray-500 text-sm">No subjects in this class yet</p>
                      ) : (
                        subjects
                          .filter(s => s.classId === userFormData.classId)
                          .map((subject) => (
                            <div key={subject.id} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={`subject-${subject.id}`}
                                checked={userFormData.subjectIds.includes(subject.id)}
                                onChange={() => handleToggleUserSubject(subject.id)}
                                className="mr-2 w-4 h-4 text-blue-600"
                              />
                              <label htmlFor={`subject-${subject.id}`} className="text-gray-700">
                                {subject.name}
                              </label>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUserId(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const userClass = classes.find(c => c.id === user.classId);
                    return (
                      <tr key={user.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'prof' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : user.role === 'prof' ? 'Teacher' : 'Student'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {userClass?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-4">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULES TAB */}
      {activeTab === 'schedules' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Manage Schedules</h2>
            <button
              onClick={() => {
                setShowScheduleForm(!showScheduleForm);
                setEditingScheduleId(null);
                setScheduleFormData({ subjectId: '', dayOfWeek: 1, startTime: '08:00', endTime: '09:00', room: '' });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold shadow-md hover:shadow-lg"
            >
              {showScheduleForm ? '✕ Cancel' : '+ Add New Schedule'}
            </button>
          </div>

          {showScheduleForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-blue-600">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">
                {editingScheduleId ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={scheduleFormData.subjectId}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, subjectId: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => {
                      const subjectClass = classes.find(c => c.id === subject.classId);
                      return (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} {subjectClass ? `(${subjectClass.name})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={scheduleFormData.dayOfWeek}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, dayOfWeek: parseInt(e.target.value) })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={scheduleFormData.startTime}
                      onChange={(e) =>
                        setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={scheduleFormData.endTime}
                      onChange={(e) =>
                        setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room (Optional)
                  </label>
                  <input
                    type="text"
                    value={scheduleFormData.room}
                    onChange={(e) =>
                      setScheduleFormData({ ...scheduleFormData, room: e.target.value })
                    }
                    placeholder="e.g., Room 101, Lab A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                  >
                    {editingScheduleId ? 'Update' : 'Create'} Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleForm(false);
                      setEditingScheduleId(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No schedules found. Create your first schedule!
                    </td>
                  </tr>
                ) : (
                  schedules
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                    .map((schedule) => {
                      const subject = subjects.find(s => s.id === schedule.subjectId);
                      const subjectClass = classes.find(c => c.id === subject?.classId);
                      return (
                        <tr key={schedule.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {subject?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {subjectClass?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {getDayName(schedule.dayOfWeek)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {schedule.startTime} - {schedule.endTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {schedule.room || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap space-x-4">
                            <button
                              onClick={() => handleEditSchedule(schedule)}
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id!)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
