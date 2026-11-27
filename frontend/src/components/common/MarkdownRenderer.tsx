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
          className="px-1.5 py-0.5 rounded bg-[#222225] text-[#ededed] border border-white/[0.08] font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={keyIdx++} className="font-medium text-[#ededed]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('$') && token.endsWith('$')) {
      nodes.push(
        <span
          key={keyIdx++}
          className="px-1.5 py-0.5 rounded bg-[#222225] text-[#e5a00d] font-mono text-[11px] border border-white/[0.08]"
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

  const blocks = content.split(/(```[\s\S]*?```|\$\$[\s\S]*?\$\$)/g);

  return (
    <div className={`space-y-3 text-xs text-[#a1a1a6] leading-relaxed ${className}`}>
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const inner = trimmed.slice(3, -3).replace(/^[a-zA-Z0-9_-]*\n/, '').trim();
          return (
            <pre
              key={blockIdx}
              className="p-3 rounded-lg bg-[#0f0f10] border border-white/[0.08] font-mono text-[11px] text-[#ededed] overflow-x-auto"
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
              className="px-4 py-2.5 rounded-lg bg-[#0f0f10] border border-white/[0.08] font-mono text-xs text-[#e5a00d] overflow-x-auto text-center"
            >
              {formula}
            </div>
          );
        }

        const lines = trimmed.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];

        const flushList = (keySuffix: string) => {
          if (listItems.length > 0) {
            elements.push(
              <ul key={`list-${blockIdx}-${keySuffix}`} className="space-y-1 pl-4 list-disc text-[#a1a1a6]">
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
              <h4 key={`h-${lineIdx}`} className="text-sm font-medium text-[#ededed] pt-1">
                {renderInline(line.slice(4))}
              </h4>
            );
          } else if (line.startsWith('## ')) {
            flushList(String(lineIdx));
            elements.push(
              <h3 key={`h2-${lineIdx}`} className="text-base font-medium text-[#ededed] pt-1">
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
