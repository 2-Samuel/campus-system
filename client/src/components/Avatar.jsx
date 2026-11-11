import React from 'react';

const gradients = [
  'from-blue-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-purple-600 to-pink-700',
  'from-amber-600 to-orange-700',
  'from-cyan-600 to-blue-700',
  'from-rose-600 to-red-700'
];

export const Avatar = ({ name = 'User', size = 'md', className = '' }) => {
  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.replace(/^(Dr\.|Prof\.|Eng\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  const charCode = name.charCodeAt(0) || 0;
  const gradient = gradients[charCode % gradients.length];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-lg font-bold',
    xl: 'w-20 h-20 text-2xl font-bold',
    '2xl': 'w-28 h-28 text-3xl font-extrabold'
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm flex-shrink-0 tracking-wider ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={name}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
};
