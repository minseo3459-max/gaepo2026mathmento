import React from 'react';
import katex from 'katex';
import { ExternalLink } from 'lucide-react';

interface MathMarkdownRendererProps {
  content: string;
}

export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({ content }) => {
  // Renders a string containing inline ($...$) or display ($$...$$) math and markdown links
  const renderMathAndText = (text: string) => {
    // Regex splits by:
    // 1. Display math: $$...$$
    // 2. Inline math: $...$
    // 3. Markdown links: [label](url)
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\[[^\]]+?\]\(https?:\/\/[^\s)]+?\))/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Display math $$...$$
      if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={idx}
              className="my-2.5 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return (
            <code key={idx} className="block font-mono bg-slate-100 p-2 my-1 text-xs rounded">
              {part}
            </code>
          );
        }
      }

      // Inline math $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={idx}
              className="mx-0.5 inline-block"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return (
            <code key={idx} className="font-mono bg-slate-100 px-1 text-xs rounded">
              {part}
            </code>
          );
        }
      }

      // Markdown links: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 mx-0.5 transition-colors"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        );
      }

      // Format bold (**...**) and plain text
      return <React.Fragment key={idx}>{renderBoldText(part)}</React.Fragment>;
    });
  };

  const renderBoldText = (text: string) => {
    const boldRegex = /(\*\*[^*]+\*\*)/g;
    const parts = text.split(boldRegex);

    return parts.map((chunk, cIdx) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={cIdx} className="font-bold text-slate-900">{chunk.slice(2, -2)}</strong>;
      }
      return chunk;
    });
  };

  // Split into lines/paragraphs while preserving empty lines
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-sm text-slate-800 break-words">
      {lines.map((line, lIdx) => {
        // If line is empty
        if (!line.trim()) {
          return <div key={lIdx} className="h-2" />;
        }

        // Header ###
        if (line.startsWith('### ')) {
          return (
            <h4 key={lIdx} className="font-bold text-slate-900 text-sm mt-3 mb-1 text-blue-900">
              {renderMathAndText(line.slice(4))}
            </h4>
          );
        }

        // Header ##
        if (line.startsWith('## ')) {
          return (
            <h3 key={lIdx} className="font-bold text-slate-900 text-base mt-3 mb-1 text-blue-950">
              {renderMathAndText(line.slice(3))}
            </h3>
          );
        }

        // Quote >
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={lIdx}
              className="border-l-3 border-blue-500 bg-blue-50/50 pl-3 py-1 my-1.5 text-xs text-blue-900 rounded-r-md"
            >
              {renderMathAndText(line.slice(2))}
            </blockquote>
          );
        }

        // Bullet point - or *
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-2 my-0.5 text-slate-700">
              <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
              <div className="flex-1">{renderMathAndText(line.slice(2))}</div>
            </div>
          );
        }

        return <div key={lIdx}>{renderMathAndText(line)}</div>;
      })}
    </div>
  );
};
