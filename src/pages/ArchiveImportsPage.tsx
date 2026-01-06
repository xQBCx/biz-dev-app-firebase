import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ArchiveImportHistory } from '@/components/archive/ArchiveImportHistory';
import { ArchiveImportWizard } from '@/components/archive/ArchiveImportWizard';
import { ArchiveImportStatus } from '@/components/archive/ArchiveImportStatus';
import { ArchiveReviewQueue } from '@/components/archive/ArchiveReviewQueue';

export default function ArchiveImportsPage() {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Routes>
        <Route path="/" element={<ArchiveImportHistory />} />
        <Route path="/new" element={<ArchiveImportWizard />} />
        <Route path="/:importId" element={<ArchiveImportStatus />} />
      </Routes>
    </div>
  );
}

export function ArchiveReviewPage() {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Routes>
        <Route path="/" element={<ArchiveReviewQueue />} />
        <Route path="/:importId" element={<ArchiveReviewQueue />} />
      </Routes>
    </div>
  );
}
