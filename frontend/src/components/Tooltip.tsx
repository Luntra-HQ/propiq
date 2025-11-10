import { HelpCircle } from 'lucide-react';
import './Tooltip.css';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export const Tooltip = ({ text, children }: TooltipProps) => {
  return (
    <span className="tooltip-container">
      {children || <HelpCircle className="tooltip-icon" />}
      <span className="tooltip-text">{text}</span>
    </span>
  );
};
