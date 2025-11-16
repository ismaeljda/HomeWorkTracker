import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface TutorialContextType {
  runTutorial: boolean;
  startTutorial: () => void;
  stopTutorial: () => void;
  hasSeenTutorial: boolean;
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const { userData } = useAuth();
  const [runTutorial, setRunTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Check if user has seen the tutorial
  useEffect(() => {
    if (userData?.uid) {
      const storageKey = `tutorial_seen_${userData.uid}_${userData.role}`;
      const seen = localStorage.getItem(storageKey);

      if (!seen) {
        // First time user - don't show automatically
        setHasSeenTutorial(false);
        setRunTutorial(false);
      } else {
        setHasSeenTutorial(true);
      }
    }
  }, [userData]);

  const startTutorial = () => {
    setRunTutorial(true);
  };

  const stopTutorial = () => {
    setRunTutorial(false);
    if (userData?.uid) {
      const storageKey = `tutorial_seen_${userData.uid}_${userData.role}`;
      localStorage.setItem(storageKey, 'true');
      setHasSeenTutorial(true);
    }
  };

  const value: TutorialContextType = {
    runTutorial,
    startTutorial,
    stopTutorial,
    hasSeenTutorial,
    tutorialStep,
    setTutorialStep
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};
