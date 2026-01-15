'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUserMessage?: boolean;
}

export function MarkdownRenderer({ content, className, isUserMessage = false }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }) => (
          <h1 className={cn(
            'text-base font-bold mt-3 mb-2 first:mt-0',
            isUserMessage ? 'text-white' : 'text-slate-900 dark:text-white'
          )}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={cn(
            'text-sm font-bold mt-3 mb-1.5 first:mt-0',
            isUserMessage ? 'text-white' : 'text-slate-900 dark:text-white'
          )}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={cn(
            'text-sm font-semibold mt-2 mb-1 first:mt-0',
            isUserMessage ? 'text-white' : 'text-slate-900 dark:text-white'
          )}>
            {children}
          </h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className={cn(
            'text-sm leading-relaxed mb-2 last:mb-0',
            isUserMessage ? 'text-white' : 'text-slate-700 dark:text-slate-200'
          )}>
            {children}
          </p>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className={cn(
            'list-disc list-inside space-y-1 mb-2 ml-1',
            isUserMessage ? 'text-white marker:text-white/70' : 'text-slate-700 dark:text-slate-200 marker:text-[var(--pwa-cyan)]'
          )}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className={cn(
            'list-decimal list-inside space-y-1 mb-2 ml-1',
            isUserMessage ? 'text-white marker:text-white/70' : 'text-slate-700 dark:text-slate-200 marker:text-[var(--pwa-cyan)]'
          )}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-sm leading-relaxed">{children}</li>
        ),
        // Code
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code
                className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-mono',
                  isUserMessage
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-[var(--pwa-blue-deep)] dark:bg-slate-700 dark:text-[var(--pwa-cyan-light)]'
                )}
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code className={cn('text-xs', className)} {...props}>
              {children}
            </code>
          );
        },
        // Code blocks
        pre: ({ children }) => (
          <pre className={cn(
            'rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono',
            isUserMessage
              ? 'bg-white/10 text-white'
              : 'bg-slate-800 text-slate-100 dark:bg-slate-950'
          )}>
            {children}
          </pre>
        ),
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className={cn(
            'border-l-3 pl-3 my-2 italic',
            isUserMessage
              ? 'border-white/50 text-white/90'
              : 'border-[var(--pwa-cyan)] text-slate-600 dark:text-slate-400'
          )}>
            {children}
          </blockquote>
        ),
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'underline underline-offset-2 hover:no-underline',
              isUserMessage
                ? 'text-white hover:text-white/80'
                : 'text-[var(--pwa-cyan)] hover:text-[var(--pwa-blue-deep)] dark:hover:text-[var(--pwa-cyan-light)]'
            )}
          >
            {children}
          </a>
        ),
        // Strong/Bold
        strong: ({ children }) => (
          <strong className={cn(
            'font-semibold',
            isUserMessage ? 'text-white' : 'text-slate-900 dark:text-white'
          )}>
            {children}
          </strong>
        ),
        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Tables (GFM)
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className={cn(
              'min-w-full text-xs border-collapse',
              isUserMessage ? 'text-white' : 'text-slate-700 dark:text-slate-200'
            )}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className={cn(
            isUserMessage ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'
          )}>
            {children}
          </thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className={cn(
            'border-b',
            isUserMessage ? 'border-white/20' : 'border-slate-200 dark:border-slate-700'
          )}>
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1.5 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1.5">{children}</td>
        ),
        // Horizontal rule
        hr: () => (
          <hr className={cn(
            'my-3',
            isUserMessage ? 'border-white/30' : 'border-slate-200 dark:border-slate-700'
          )} />
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
