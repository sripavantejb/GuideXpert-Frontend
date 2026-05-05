/* eslint-disable react-refresh/only-export-components -- paired Provider + hook for WhatsApp ops section */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const WhatsappOpsHostContext = createContext(null);

export function WhatsappOpsHostProvider({ children }) {
  const [showMissingApisBanner, setShowMissingApisBanner] = useState(false);

  const notifyWhatsappOpsApi404 = useCallback(() => setShowMissingApisBanner(true), []);
  const clearWhatsappOpsApi404 = useCallback(() => setShowMissingApisBanner(false), []);

  const value = useMemo(
    () => ({
      notifyWhatsappOpsApi404,
      clearWhatsappOpsApi404,
      showMissingApisBanner,
    }),
    [notifyWhatsappOpsApi404, clearWhatsappOpsApi404, showMissingApisBanner]
  );

  return <WhatsappOpsHostContext.Provider value={value}>{children}</WhatsappOpsHostContext.Provider>;
}

export function useWhatsappOpsHost() {
  const ctx = useContext(WhatsappOpsHostContext);
  if (!ctx) {
    throw new Error('useWhatsappOpsHost must be used inside WhatsappOpsHostProvider');
  }
  return ctx;
}
