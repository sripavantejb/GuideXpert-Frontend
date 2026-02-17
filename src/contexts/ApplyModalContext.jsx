import { useState } from 'react';
import ApplyFormModal from '../components/UI/ApplyFormModal';
import { ApplyModalContext } from './ApplyModalContextRef';

export function ApplyModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openApplyModal = () => {
    const el = document.querySelector('#home');
    if (el) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 80;
      const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };
  const closeApplyModal = () => setIsOpen(false);

  return (
    <ApplyModalContext.Provider value={{ openApplyModal, closeApplyModal }}>
      {children}
      <ApplyFormModal isOpen={isOpen} onClose={closeApplyModal} />
    </ApplyModalContext.Provider>
  );
}
