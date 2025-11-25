/**
 * StreamingText Component - 2025 Design System
 *
 * Typewriter effect for AI-generated text, creating the feeling
 * of real-time intelligence and engagement.
 */

import React, { useState, useEffect, useRef } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number; // Characters per second
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
  delay?: number; // Initial delay before starting
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 50,
  className = '',
  onComplete,
  cursor = true,
  delay = 0,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    setIsComplete(false);
    setHasStarted(false);

    // Initial delay
    const delayTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let currentIndex = 0;
    const interval = 1000 / speed;

    intervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsComplete(true);
        onComplete?.();
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hasStarted, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {cursor && !isComplete && (
        <span className="typing-cursor" />
      )}
    </span>
  );
};

/**
 * StreamingParagraph - Multi-line streaming with paragraph support
 */
interface StreamingParagraphProps {
  paragraphs: string[];
  speed?: number;
  className?: string;
  paragraphClassName?: string;
  onComplete?: () => void;
  delayBetween?: number;
}

export const StreamingParagraph: React.FC<StreamingParagraphProps> = ({
  paragraphs,
  speed = 60,
  className = '',
  paragraphClassName = '',
  onComplete,
  delayBetween = 300,
}) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [completedParagraphs, setCompletedParagraphs] = useState<string[]>([]);

  const handleParagraphComplete = () => {
    if (currentParagraph < paragraphs.length - 1) {
      setCompletedParagraphs((prev) => [...prev, paragraphs[currentParagraph]]);
      setTimeout(() => {
        setCurrentParagraph((prev) => prev + 1);
      }, delayBetween);
    } else {
      setCompletedParagraphs((prev) => [...prev, paragraphs[currentParagraph]]);
      onComplete?.();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {completedParagraphs.map((para, index) => (
        <p key={index} className={paragraphClassName}>
          {para}
        </p>
      ))}
      {currentParagraph < paragraphs.length && !completedParagraphs.includes(paragraphs[currentParagraph]) && (
        <p className={paragraphClassName}>
          <StreamingText
            text={paragraphs[currentParagraph]}
            speed={speed}
            onComplete={handleParagraphComplete}
          />
        </p>
      )}
    </div>
  );
};

/**
 * StreamingList - Streaming bullet points
 */
interface StreamingListProps {
  items: string[];
  speed?: number;
  className?: string;
  itemClassName?: string;
  onComplete?: () => void;
  delayBetween?: number;
  icon?: React.ReactNode;
}

export const StreamingList: React.FC<StreamingListProps> = ({
  items,
  speed = 50,
  className = '',
  itemClassName = '',
  onComplete,
  delayBetween = 200,
  icon,
}) => {
  const [currentItem, setCurrentItem] = useState(0);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const handleItemComplete = () => {
    if (currentItem < items.length - 1) {
      setCompletedItems((prev) => [...prev, items[currentItem]]);
      setTimeout(() => {
        setCurrentItem((prev) => prev + 1);
      }, delayBetween);
    } else {
      setCompletedItems((prev) => [...prev, items[currentItem]]);
      onComplete?.();
    }
  };

  return (
    <ul className={`space-y-2 ${className}`}>
      {completedItems.map((item, index) => (
        <li key={index} className={`flex items-start gap-2 ${itemClassName}`}>
          {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
          <span>{item}</span>
        </li>
      ))}
      {currentItem < items.length && !completedItems.includes(items[currentItem]) && (
        <li className={`flex items-start gap-2 ${itemClassName}`}>
          {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
          <StreamingText
            text={items[currentItem]}
            speed={speed}
            onComplete={handleItemComplete}
          />
        </li>
      )}
    </ul>
  );
};

/**
 * AIThinkingIndicator - Shows AI is processing
 */
interface AIThinkingIndicatorProps {
  message?: string;
  className?: string;
}

export const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  message = 'Analyzing',
  className = '',
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-gray-400 text-sm">
        {message}{dots}
      </span>
    </div>
  );
};

export default StreamingText;
