import { useState } from 'react';
import ApplyFormModal from '../components/UI/ApplyFormModal';
import { ApplyModalContext } from './ApplyModalContextRef';

export function ApplyModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openApplyModal = () => setIsOpen(true);
  const closeApplyModal = () => setIsOpen(false);

  return (
    <ApplyModalContext.Provider value={{ openApplyModal, closeApplyModal }}>
      {children}
      <ApplyFormModal isOpen={isOpen} onClose={closeApplyModal} />
    </ApplyModalContext.Provider>
  );
}
