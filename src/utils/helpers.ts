import { Timestamp } from 'firebase/firestore';

export const formatDate = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isLate = (deadline: Timestamp): boolean => {
  const now = new Date();
  const deadlineDate = deadline.toDate();
  return deadlineDate < now;
};

export const isDueTomorrow = (deadline: Timestamp): boolean => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const today = new Date(now);
  today.setHours(23, 59, 59, 999);

  const deadlineDate = deadline.toDate();

  return deadlineDate > today && deadlineDate <= tomorrow;
};

export const filterHomeworks = <T extends { title: string; description: string }>(
  items: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm) return items;

  const lowerSearch = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerSearch) ||
      item.description.toLowerCase().includes(lowerSearch)
  );
};
