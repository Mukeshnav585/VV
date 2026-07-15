import { getInitials } from '@/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const colors = [
  'bg-purple-600', 'bg-blue-600', 'bg-teal-600',
  'bg-green-600', 'bg-orange-600', 'bg-pink-600',
  'bg-indigo-600', 'bg-rose-600',
];

const getColor = (name: string) => colors[name.charCodeAt(0) % colors.length];

export default function Avatar({ name, size = 'md', isOnline }: AvatarProps) {
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeMap[size]} ${getColor(name)} rounded-full flex items-center justify-center font-semibold text-white select-none`}>
        {getInitials(name)}
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-whatsapp-header ${
            isOnline ? 'bg-whatsapp-green' : 'bg-whatsapp-text-muted'
          }`}
        />
      )}
    </div>
  );
}
