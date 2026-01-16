import React from 'react';
import { FeedbackStream } from './FeedbackStream';

export const ExaminerSidebar: React.FC = () => {
  return (
    <div className="h-full bg-[#F3F4F6] border-r border-gray-200 overflow-hidden shadow-xl z-20 relative">
      <FeedbackStream />
    </div>
  );
};
