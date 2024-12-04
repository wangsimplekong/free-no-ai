import { create } from 'zustand';

interface DetectionState {
  wordCount: number;
  taskId: string | null;
  fileName: string | null;
  
  setDetectionInfo: (info: {
    wordCount: number;
    taskId: string;
    fileName: string;
  }) => void;
  
  reset: () => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  wordCount: 0,
  taskId: null,
  fileName: null,

  setDetectionInfo: (info) => {
    set({
      wordCount: info.wordCount,
      taskId: info.taskId,
      fileName: info.fileName,
    });
  },

  reset: () => {
    set({
      wordCount: 0,
      taskId: null,
      fileName: null,
    });
  },
}));