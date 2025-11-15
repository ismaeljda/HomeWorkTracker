// Consistent color scheme for courses based on course ID
export const colorSchemes = [
  {
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-200 text-blue-800',
    header: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    accentColor: 'blue',
  },
  {
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-200 text-emerald-800',
    header: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    accentColor: 'emerald',
  },
  {
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-200 text-amber-800',
    header: 'bg-gradient-to-br from-amber-500 to-orange-600',
    accentColor: 'amber',
  },
  {
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    badge: 'bg-violet-200 text-violet-800',
    header: 'bg-gradient-to-br from-violet-500 to-purple-600',
    accentColor: 'violet',
  },
  {
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    badge: 'bg-rose-200 text-rose-800',
    header: 'bg-gradient-to-br from-rose-500 to-pink-600',
    accentColor: 'rose',
  },
  {
    gradient: 'from-cyan-500 to-sky-600',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    badge: 'bg-cyan-200 text-cyan-800',
    header: 'bg-gradient-to-br from-cyan-500 to-sky-600',
    accentColor: 'cyan',
  },
  {
    gradient: 'from-fuchsia-500 to-pink-600',
    iconBg: 'bg-fuchsia-100',
    iconColor: 'text-fuchsia-600',
    badge: 'bg-fuchsia-200 text-fuchsia-800',
    header: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',
    accentColor: 'fuchsia',
  },
  {
    gradient: 'from-lime-500 to-green-600',
    iconBg: 'bg-lime-100',
    iconColor: 'text-lime-600',
    badge: 'bg-lime-200 text-lime-800',
    header: 'bg-gradient-to-br from-lime-500 to-green-600',
    accentColor: 'lime',
  },
];

// Get consistent color for a course ID
export function getCourseColor(courseId: string) {
  // Create a simple hash from the course ID
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorSchemes.length;
  return colorSchemes[index];
}
