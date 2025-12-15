import { useState, useEffect } from 'react';

const FORGE_MESSAGES = [
  'Heating the cauldron…',
  'Transmuting thoughts…',
  'Clarity forming…',
  'Stirring the essence…',
  'Crystallizing insights…',
  'Forging connections…'
];

export function useForgeLoading(isLoading) {
  const [currentMessage, setCurrentMessage] = useState(FORGE_MESSAGES[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      setCurrentMessage(FORGE_MESSAGES[0]);
      return;
    }

    // Start with first message
    setCurrentMessage(FORGE_MESSAGES[0]);
    setMessageIndex(0);

    // Cycle through messages every 2 seconds
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = (prev + 1) % FORGE_MESSAGES.length;
        setCurrentMessage(FORGE_MESSAGES[next]);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return currentMessage;
}


