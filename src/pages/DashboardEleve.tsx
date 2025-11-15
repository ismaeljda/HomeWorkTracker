import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHomeworks } from '../hooks/useHomeworks';
import { getStudentSubjects, type Subject, updateHomework } from '../firebase/firestore';
import HomeworkCard from '../components/HomeworkCard';
import FilterBar from '../components/FilterBar';
import { filterHomeworks } from '../utils/helpers';

const DashboardEleve: React.FC = () => {
  const { userData } = useAuth();
  const { homeworks, loading, refetch } = useHomeworks({
    classId: userData?.classId
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!userData?.uid) return;
      try {
        const data = await getStudentSubjects(userData.uid);
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [userData?.uid]);

  const handleMarkComplete = async (id: string) => {
    try {
      await updateHomework(id, { status: 'complete' });
      refetch();
    } catch (error) {
      console.error('Error marking homework as complete:', error);
    }
  };

  const filteredHomeworks = homeworks
    .filter((hw) => !selectedSubject || hw.subjectId === selectedSubject)
    .filter((hw) => !selectedStatus || hw.status === selectedStatus)
    .filter((hw) => filterHomeworks([hw], searchTerm).length > 0);

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

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        subjects={subjects}
        showSubjectFilter
        showStatusFilter
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
              onMarkComplete={handleMarkComplete}
              showActions
              role="eleve"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardEleve;
