import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UploadZone } from '../ui/UploadZone';
import { AssessmentToggle } from '../ui/AssessmentToggle';
import { ExaminerSidebar } from '../examiner/ExaminerSidebar';
import { ArtifactTextViewer } from '../artifact/ArtifactTextViewer';
import { DraftEditor } from '../artifact/DraftEditor';

export const AppLayout: React.FC = () => {
  const { viewMode } = useAppStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper-white">
      {/* Left Column: The Examiner (35% width) */}
      <div className="w-[35%] min-w-[350px] max-w-[500px] h-full z-10 shadow-xl">
        <ExaminerSidebar />
      </div>

      {/* Right Column: The Artifact (Remaining width) */}
      <div className="flex-1 h-full relative">
        {viewMode === 'draft' ? <DraftEditor /> : <ArtifactTextViewer />}
        <AssessmentToggle />
      </div>
    </div>
  );
};
