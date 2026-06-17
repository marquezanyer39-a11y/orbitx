import { useCallback, useEffect, useRef } from 'react';

type TimeoutHandle = ReturnType<typeof setTimeout>;

export function useAstraVoiceTimers(onResumeTimerCleared?: () => void) {
  const resumeConversationTimeoutRef = useRef<TimeoutHandle | null>(null);

  const clearResumeConversationTimeout = useCallback(() => {
    if (!resumeConversationTimeoutRef.current) {
      return;
    }

    clearTimeout(resumeConversationTimeoutRef.current);
    resumeConversationTimeoutRef.current = null;
    onResumeTimerCleared?.();
  }, [onResumeTimerCleared]);

  const scheduleResumeConversationTimeout = useCallback(
    (callback: () => void, delayMs: number) => {
      clearResumeConversationTimeout();
      resumeConversationTimeoutRef.current = setTimeout(() => {
        resumeConversationTimeoutRef.current = null;
        callback();
      }, delayMs);
    },
    [clearResumeConversationTimeout],
  );

  useEffect(() => clearResumeConversationTimeout, [clearResumeConversationTimeout]);

  return {
    clearResumeConversationTimeout,
    scheduleResumeConversationTimeout,
  };
}
