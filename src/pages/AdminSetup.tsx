import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Class, Subject } from '../firebase/firestore';

interface InvitationCode {
  code: string;
  role: 'prof' | 'eleve';
  name: string;
  email: string;
  classId?: string;
  used: boolean;
}

const AdminSetup: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);

  const [newClass, setNewClass] = useState({ name: '', teacherId: '' });
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [newInvitation, setNewInvitation] = useState({
    name: '',
    email: '',
    role: 'eleve' as 'prof' | 'eleve',
    classId: ''
  });

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
    }
    fetchData();
  }, [userData, navigate]);

  const fetchData = async () => {
    const classesSnap = await getDocs(collection(db, 'classes'));
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    const invitationsSnap = await getDocs(collection(db, 'invitations'));

    setClasses(classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    setSubjects(subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    setInvitations(invitationsSnap.docs.map(doc => doc.data() as InvitationCode));
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'classes'), newClass);
      setNewClass({ name: '', teacherId: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'subjects'), newSubject);
      setNewSubject({ name: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const code = generateCode();
      const invitation: InvitationCode = {
        code,
        role: newInvitation.role,
        name: newInvitation.name,
        email: newInvitation.email,
        classId: newInvitation.role === 'eleve' ? newInvitation.classId : undefined,
        used: false
      };

      await addDoc(collection(db, 'invitations'), invitation);
      setNewInvitation({ name: '', email: '', role: 'eleve', classId: '' });
      fetchData();
      alert(`Code d'invitation créé: ${code}\nEnvoyez ce code à ${newInvitation.name}`);
    } catch (error) {
      console.error('Error creating invitation:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Setup</h1>
        <p className="text-gray-600">Configure classes, subjects, and invite users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Class */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-blue-100 p-2 rounded-lg mr-3">🏫</span>
            Create Class
          </h2>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class Name
              </label>
              <input
                type="text"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                placeholder="e.g., 6ème A, Terminale S"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
            >
              Create Class
            </button>
          </form>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Existing Classes</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-gray-50 px-4 py-2 rounded-lg">
                  {cls.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Subject */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-purple-100 p-2 rounded-lg mr-3">📚</span>
            Create Subject
          </h2>
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject Name
              </label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                placeholder="e.g., Mathematics, French, History"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
            >
              Create Subject
            </button>
          </form>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Existing Subjects</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {subjects.map((subject) => (
                <div key={subject.id} className="bg-gray-50 px-4 py-2 rounded-lg">
                  {subject.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Invitation */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-green-100 p-2 rounded-lg mr-3">✉️</span>
            Generate Invitation Code
          </h2>
          <form onSubmit={handleCreateInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newInvitation.name}
                  onChange={(e) => setNewInvitation({ ...newInvitation, name: e.target.value })}
                  placeholder="Student/Teacher name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newInvitation.role}
                  onChange={(e) => setNewInvitation({ ...newInvitation, role: e.target.value as 'prof' | 'eleve' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="eleve">Student (Élève)</option>
                  <option value="prof">Teacher (Professeur)</option>
                </select>
              </div>

              {newInvitation.role === 'eleve' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    value={newInvitation.classId}
                    onChange={(e) => setNewInvitation({ ...newInvitation, classId: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
            >
              Generate Invitation Code
            </button>
          </form>

          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-3">Generated Invitations</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Code</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invitations.map((inv, idx) => (
                    <tr key={idx} className={inv.used ? 'bg-gray-50' : ''}>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{inv.code}</td>
                      <td className="px-4 py-3">{inv.name}</td>
                      <td className="px-4 py-3">{inv.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          inv.role === 'prof' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {inv.role === 'prof' ? '👨‍🏫 Teacher' : '🎓 Student'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {inv.used ? (
                          <span className="text-gray-500 text-sm">✓ Used</span>
                        ) : (
                          <span className="text-green-600 text-sm font-semibold">Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
