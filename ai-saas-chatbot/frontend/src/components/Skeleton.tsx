import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 'var(--radius-sm)', 
  className = '',
  style 
}) => {
  return (
    <div 
      className={`shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.05)',
        ...style
      }}
    />
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="glass p-6 rounded-2xl animate-fade-in">
    <Skeleton width="40%" height={24} className="mb-4" />
    <Skeleton width="100%" height={120} className="mb-4" />
    <div className="space-y-2">
      <Skeleton width="90%" height={12} />
      <Skeleton width="80%" height={12} />
      <Skeleton width="60%" height={12} />
    </div>
  </div>
);

export const SkeletonReportHeader: React.FC = () => (
  <div className="glass p-8 rounded-[24px] mb-6">
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Skeleton width={80} height={80} borderRadius="var(--radius-lg)" />
      <div style={{ flex: 1 }}>
        <Skeleton width="30%" height={32} className="mb-2" />
        <Skeleton width="50%" height={16} />
      </div>
    </div>
    <div className="grid grid-cols-4 gap-4 mt-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white/5 p-4 rounded-xl">
          <Skeleton width="40%" height={12} className="mb-2" />
          <Skeleton width="60%" height={24} />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
