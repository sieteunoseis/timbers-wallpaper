import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Accordion panel component for collapsible sections
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Panel title
 * @param {React.ReactNode} props.children - Panel content
 * @param {boolean} props.defaultOpen - Whether the panel is open by default
 * @param {string} props.icon - Optional icon component to display next to title
 * @returns {JSX.Element} Accordion panel component
 */
const AccordionPanel = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
      <button
        className="w-full px-6 py-4 flex items-center justify-between text-xl font-bold text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{title}</span>
        </div>
        <span className="text-white/80">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionPanel;
