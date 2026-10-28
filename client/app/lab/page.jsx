'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import LabWorkspace from '@/components/LabWorkspace';

export default function LabPage() {
  return (
    <ProtectedRoute>
      <LabWorkspace />
    </ProtectedRoute>
  );
}
