import { useEffect, useRef } from 'react';
import { fileDetectionService } from '../services/file-detection.service';
import type { QueryDetectionResponse } from '../types/file-detection.types';

/**
 * Hook for polling detection results
 * @param taskIds Array of task IDs to poll
 * @param callback Callback function to handle polling results
 */
export const useDetectionPolling = (
  taskIds: string[],
  callback: (response: QueryDetectionResponse) => void
) => {
  // Use ref to store the current polling task IDs
  const pollingTasksRef = useRef<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize polling tasks
    pollingTasksRef.current = taskIds.filter(v => !!v);

    const pollResults = async () => {
      try {
        // Skip if no tasks to poll
        if (pollingTasksRef.current.length === 0) {
          return;
        }

        // Query results for current polling tasks
        const response = await fileDetectionService.queryResults({
          taskIds: pollingTasksRef.current
        });

        // Execute callback with results
        callback(response);

        // Update polling tasks - filter out completed/failed tasks
        pollingTasksRef.current = pollingTasksRef.current.filter(taskId => {
          const result = response.data.results.find(r => r.taskId === taskId);
          return result && result.state !== -1 && result.state !== 3;
        });

        // Continue polling if there are remaining tasks
        if (pollingTasksRef.current.length > 0) {
          timerRef.current = setTimeout(pollResults, 5000);
        }
      } catch (error) {
        console.error('Failed to poll detection results:', error);
        // Continue polling even on error if there are tasks
        if (pollingTasksRef.current.length > 0) {
          timerRef.current = setTimeout(pollResults, 5000);
        }
      }
    };

    // Start polling
    pollResults();

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      pollingTasksRef.current = [];
    };
  }, [taskIds, callback]);
};