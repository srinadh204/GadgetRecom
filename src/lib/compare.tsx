import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Gadget } from '@/types';

interface CompareContextValue {
  compareList: Gadget[];
  toggleCompare: (gadget: Gadget) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  isFull: boolean;
}

const MAX_COMPARE = 4;

const CompareContext = createContext<CompareContextValue>({
  compareList: [],
  toggleCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
  isFull: false,
});

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Gadget[]>([]);

  const isInCompare = (id: string) => compareList.some((g) => g.id === id);

  const toggleCompare = (gadget: Gadget) => {
    setCompareList((prev) => {
      if (prev.some((g) => g.id === gadget.id)) {
        return prev.filter((g) => g.id !== gadget.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, gadget];
    });
  };

  const removeFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((g) => g.id !== id));
  };

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isFull: compareList.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
