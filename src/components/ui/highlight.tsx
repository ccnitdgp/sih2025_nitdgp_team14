'use client';
import React from 'react';

type HighlightProps = {
  text: string;
  query: string;
};

export const Highlight: React.FC<HighlightProps> = ({ text, query }) => {
  if (!query) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-300 text-foreground px-1 rounded-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};
