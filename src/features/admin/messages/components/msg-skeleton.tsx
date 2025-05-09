import { nanoid } from 'nanoid';
import { useMemo } from 'react';

export default function MessageSkeleton() {
  const SKELETON_COUNT = 4;
  const memoizedKeys = useMemo(() => 
    Array.from({ length: SKELETON_COUNT }, () => nanoid()),  
  []  
  );

  return (
    <div className="space-y-4">
      {memoizedKeys.map((key) => (
        <div key={key} className="animate-pulse rounded-lg border p-4">
          <div className="mb-2 h-6 rounded bg-gray-300"></div>
          <div className="space-y-2">
            <div className="h-4 rounded bg-gray-300"></div>
            <div className="h-4 rounded bg-gray-300"></div>
            <div className="h-4 rounded bg-gray-300"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
