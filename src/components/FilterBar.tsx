import React from 'react';
import type { Class, Subject } from '../firebase/firestore';

interface SubjectWithClass extends Subject {
  className?: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedClass?: string;
  onClassChange?: (value: string) => void;
  selectedSubject?: string;
  onSubjectChange?: (value: string) => void;
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  selectedType?: string;
  onTypeChange?: (value: string) => void;
  classes?: Class[];
  subjects?: SubjectWithClass[];
  showClassFilter?: boolean;
  showSubjectFilter?: boolean;
  showStatusFilter?: boolean;
  showTypeFilter?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  classes = [],
  subjects = [],
  showClassFilter = false,
  showSubjectFilter = false,
  showStatusFilter = false,
  showTypeFilter = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search homework..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showClassFilter && onClassChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSubjectFilter && onSubjectChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.className ? `${subject.name} - ${subject.className}` : subject.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {showStatusFilter && onStatusChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        )}

        {showTypeFilter && onTypeChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="homework">📚 Homework</option>
              <option value="exam">📝 Exam</option>
              <option value="quiz">❓ Quiz</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
