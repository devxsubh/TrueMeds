'use client';

import { useMemo } from 'react';

/**
 * Formats AI response text with markdown-like formatting
 * Handles: bold text, line breaks, lists, paragraphs
 */
const MessageFormatter = ({ content }) => {
  const formattedContent = useMemo(() => {
    if (!content) return '';

    let formatted = content;

    // Normalize line breaks
    formatted = formatted.replace(/\r\n/g, '\n');
    formatted = formatted.replace(/\r/g, '\n');
    
    // Convert multiple line breaks to double line breaks (paragraph breaks)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // If text has no double line breaks but has numbered lists, add line breaks before numbers
    if (!formatted.includes('\n\n') && formatted.match(/\d+\.\s/)) {
      // Add line break before numbered items (but not if already at start of line)
      formatted = formatted.replace(/([^\n])(\n?)(\d+\.\s)/g, '$1\n\n$3');
    }
    
    // Split by double line breaks (paragraphs)
    const parts = formatted.split(/(\n\n+)/);

    const elements = [];
    let currentList = null;
    let listType = null;

    parts.forEach((part, idx) => {
      const trimmed = part.trim();
      
      // Skip empty parts
      if (!trimmed) return;

      // Check if it's a numbered list item
      const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)$/);
      if (numberedMatch) {
        if (listType !== 'numbered') {
          // Close previous list if exists
          if (currentList) {
            elements.push(currentList);
          }
          // Start new numbered list
          currentList = { type: 'numbered', items: [] };
          listType = 'numbered';
        }
        currentList.items.push(numberedMatch[2]);
        return;
      }

      // Check if it's a bullet list item
      const bulletMatch = trimmed.match(/^[-•*]\s(.+)$/);
      if (bulletMatch) {
        if (listType !== 'bullet') {
          // Close previous list if exists
          if (currentList) {
            elements.push(currentList);
          }
          // Start new bullet list
          currentList = { type: 'bullet', items: [] };
          listType = 'bullet';
        }
        currentList.items.push(bulletMatch[1]);
        return;
      }

      // Not a list item - close any open list first
      if (currentList) {
        elements.push(currentList);
        currentList = null;
        listType = null;
      }

      // Regular paragraph
      elements.push({ type: 'paragraph', content: trimmed });
    });

    // Close any remaining list
    if (currentList) {
      elements.push(currentList);
    }

    // Render elements
    return elements.map((element, idx) => {
      if (element.type === 'numbered') {
        return (
          <ol key={idx} className="formatted-list numbered-list">
            {element.items.map((item, itemIdx) => (
              <li key={itemIdx} className="formatted-list-item">
                <FormattedText text={item} />
              </li>
            ))}
          </ol>
        );
      }
      
      if (element.type === 'bullet') {
        return (
          <ul key={idx} className="formatted-list bullet-list">
            {element.items.map((item, itemIdx) => (
              <li key={itemIdx} className="formatted-list-item">
                <FormattedText text={item} />
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={idx} className="formatted-paragraph">
          <FormattedText text={element.content} />
        </p>
      );
    });
  }, [content]);

  return <div className="formatted-message">{formattedContent}</div>;
};

/**
 * Formats inline text (bold, emphasis, etc.)
 */
const FormattedText = ({ text }) => {
  if (!text) return null;

  // Split by **bold** markers (non-greedy)
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, idx) => {
        // Bold text
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          const boldText = part.slice(2, -2);
          return <strong key={idx} className="formatted-bold">{boldText}</strong>;
        }
        
        // Regular text - handle inline line breaks (for single line breaks within paragraphs)
        if (part.includes('\n')) {
          const lines = part.split('\n');
          return lines.map((line, lineIdx) => (
            <span key={`${idx}-${lineIdx}`}>
              {line}
              {lineIdx < lines.length - 1 && <br className="inline-break" />}
            </span>
          ));
        }
        
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
};

export default MessageFormatter;
