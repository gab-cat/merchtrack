import { nanoid } from 'nanoid';
import React from 'react';

export default function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map(() => (
        <div key={nanoid()} className="animate-pulse rounded-lg border p-4">
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
