import React, { useState, useEffect } from 'react';
import {
  getAllClasses,
  getAllSubjects,
  type Class,
  type Subject,
  addClass,
  updateClass,
  deleteClass,
  addSubject,
  updateSubject,
  deleteSubject
} from '../firebase/firestore';

type ActiveTab = 'classes' | 'subjects' | 'users';

const DashboardAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [showClassForm, setShowClassForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  const [classFormData, setClassFormData] = useState({
    name: '',
    teacherId: ''
  });

  const [subjectFormData, setSubjectFormData] = useState({
    name: ''
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
      setClassFormData({ name: '', teacherId: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

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
      setSubjectFormData({ name: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleEditClass = (cls: Class) => {
    setEditingClassId(cls.id);
    setClassFormData({ name: cls.name, teacherId: cls.teacherId });
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

  const handleEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectFormData({ name: subject.name });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'classes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'subjects'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Users
          </button>
        </nav>
      </div>

      {activeTab === 'classes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Classes</h2>
            <button
              onClick={() => {
                setShowClassForm(!showClassForm);
                setEditingClassId(null);
                setClassFormData({ name: '', teacherId: '' });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              {showClassForm ? 'Cancel' : 'Add New Class'}
            </button>
          </div>

          {showClassForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingClassId ? 'Edit Class' : 'Add New Class'}
              </h3>
              <form onSubmit={handleClassSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={classFormData.name}
                    onChange={(e) =>
                      setClassFormData({ ...classFormData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher ID
                  </label>
                  <input
                    type="text"
                    value={classFormData.teacherId}
                    onChange={(e) =>
                      setClassFormData({ ...classFormData, teacherId: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {editingClassId ? 'Update' : 'Create'} Class
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowClassForm(false);
                      setEditingClassId(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{cls.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cls.teacherId}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditClass(cls)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Subjects</h2>
            <button
              onClick={() => {
                setShowSubjectForm(!showSubjectForm);
                setEditingSubjectId(null);
                setSubjectFormData({ name: '' });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              {showSubjectForm ? 'Cancel' : 'Add New Subject'}
            </button>
          </div>

          {showSubjectForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingSubjectId ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <form onSubmit={handleSubjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={subjectFormData.name}
                    onChange={(e) =>
                      setSubjectFormData({ ...subjectFormData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    {editingSubjectId ? 'Update' : 'Create'} Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubjectForm(false);
                      setEditingSubjectId(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
          <p className="text-gray-600">User management coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
