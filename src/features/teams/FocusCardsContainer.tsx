import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface FocusCardsContextType {
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  onCardHover: (id: string) => void;
  onCardLeave: (id: string) => void;
  onCardToggle: (id: string) => void;
}

const FocusCardsContext = createContext<FocusCardsContextType>({
  focusedId: null,
  setFocusedId: () => {},
  onCardHover: () => {},
  onCardLeave: () => {},
  onCardToggle: () => {},
});

export const useFocusCards = () => useContext(FocusCardsContext);

export interface FocusCardsContainerProps {
  children: ReactNode;
  className?: string;
  onFocusChange?: (id: string | null) => void;
}

/**
 * FocusCardsContainer
 * Implements Aceternity Focus Cards logic:
 * When one card is hovered or focused, all other cards fade and subtly blur,
 * while the active card is prominently brought forward.
 */
export const FocusCardsContainer: React.FC<FocusCardsContainerProps> = ({
  children,
  className = '',
  onFocusChange,
}) => {
  const [focusedId, setFocusedIdState] = useState<string | null>(null);

  const setFocusedId = useCallback(
    (id: string | null) => {
      setFocusedIdState(id);
      onFocusChange?.(id);
    },
    [onFocusChange]
  );

  const onCardHover = useCallback(
    (id: string) => {
      setFocusedId(id);
    },
    [setFocusedId]
  );

  const onCardLeave = useCallback(
    (id: string) => {
      setFocusedIdState((current) => {
        if (current === id) {
          onFocusChange?.(null);
          return null;
        }
        return current;
      });
    },
    [onFocusChange]
  );

  const onCardToggle = useCallback(
    (id: string) => {
      setFocusedIdState((current) => {
        const next = current === id ? null : id;
        onFocusChange?.(next);
        return next;
      });
    },
    [onFocusChange]
  );

  return (
    <FocusCardsContext.Provider
      value={{
        focusedId,
        setFocusedId,
        onCardHover,
        onCardLeave,
        onCardToggle,
      }}
    >
      <div
        className={`focus-cards-container ${className}`}
        onMouseLeave={() => setFocusedId(null)}
      >
        {children}
      </div>
    </FocusCardsContext.Provider>
  );
};
