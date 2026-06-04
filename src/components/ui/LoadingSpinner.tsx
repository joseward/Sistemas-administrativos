'use client';

import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full border-4 border-gray-200"
        />
        <div
          className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
        />
      </div>
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <LoadingSpinner />
    </div>
  );
}
