import { useContext } from 'react';
import { ApplyModalContext } from './ApplyModalContextRef';

export function useApplyModal() {
  const ctx = useContext(ApplyModalContext);
  if (!ctx) throw new Error('useApplyModal must be used within ApplyModalProvider');
  return ctx;
}
