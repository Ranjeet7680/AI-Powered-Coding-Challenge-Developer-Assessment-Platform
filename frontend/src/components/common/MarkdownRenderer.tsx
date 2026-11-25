import React from 'react';

function formatMathTokens(expr: string): string {
  return expr
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\mathcal\{([^}]*)\}/g, '$1')
    .replace(/\\mathbb\{([^}]*)\}/g, '$1')
    .replace(/\\hat\{y\}/g, 'ŷ')
    .replace(/\\hat\{([^}]*)\}/g, '$1̂')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1) / ($2)')
    .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, '∑[$1..$2]')
    .replace(/\\sum_\{([^}]*)\}/g, '∑[$1]')
    .replace(/\\sum/g, '∑')
    .replace(/\\alpha/g, 'α')
    .replace(/\\partial/g, '∂')
    .replace(/\\quad/g, '  ')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\in/g, '∈')
    .replace(/\\to/g, '→')
    .replace(/\\infty/g, '∞')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\log/g, 'log')
    .replace(/\\max/g, 'max')
    .replace(/\\exp/g, 'exp')
    .trim();
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match inline code (`...`), bold (**...**), or inline math ($...$)
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\$[^$\n]+\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded bg-slate-800/90 text-indigo-300 border border-slate-700/60 font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={keyIdx++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('$') && token.endsWith('$')) {
      nodes.push(
        <span
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded bg-indigo-950/50 text-cyan-300 font-mono text-[11px] border border-indigo-500/20"
        >
          {formatMathTokens(token.slice(1, -1))}
        </span>
      );
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split by fenced code blocks and display math blocks first
  const blocks = content.split(/(```[\s\S]*?```|\$\$[\s\S]*?\$\$)/g);

  return (
    <div className={`space-y-3 text-xs text-slate-300 leading-relaxed ${className}`}>
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const inner = trimmed.slice(3, -3).replace(/^[a-zA-Z0-9_-]*\n/, '').trim();
          return (
            <pre
              key={blockIdx}
              className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto"
            >
              {inner}
            </pre>
          );
        }

        if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
          const formula = formatMathTokens(trimmed.slice(2, -2));
          return (
            <div
              key={blockIdx}
              className="px-4 py-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/25 font-mono text-xs text-cyan-200 overflow-x-auto text-center"
            >
              {formula}
            </div>
          );
        }

        // Parse lines for headings, bullets, ordered items, and paragraphs
        const lines = trimmed.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];

        const flushList = (keySuffix: string) => {
          if (listItems.length > 0) {
            elements.push(
              <ul key={`list-${blockIdx}-${keySuffix}`} className="space-y-1 pl-4 list-disc text-slate-300">
                {listItems.map((item, liIdx) => (
                  <li key={liIdx}>{renderInline(item)}</li>
                ))}
              </ul>
            );
            listItems = [];
          }
        };

        lines.forEach((rawLine, lineIdx) => {
          const line = rawLine.trim();
          if (!line) {
            flushList(String(lineIdx));
            return;
          }
          if (line.startsWith('### ')) {
            flushList(String(lineIdx));
            elements.push(
              <h4 key={`h-${lineIdx}`} className="text-sm font-bold text-white pt-1">
                {renderInline(line.slice(4))}
              </h4>
            );
          } else if (line.startsWith('## ')) {
            flushList(String(lineIdx));
            elements.push(
              <h3 key={`h2-${lineIdx}`} className="text-base font-bold text-white pt-1">
                {renderInline(line.slice(3))}
              </h3>
            );
          } else if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
            listItems.push(line.replace(/^([-*]|\d+\.)\s+/, ''));
          } else {
            flushList(String(lineIdx));
            elements.push(<p key={`p-${lineIdx}`}>{renderInline(line)}</p>);
          }
        });

        flushList('end');
        return <React.Fragment key={blockIdx}>{elements}</React.Fragment>;
      })}
    </div>
  );
};
