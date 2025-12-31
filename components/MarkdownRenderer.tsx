"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          p({ node, children, ...props }: any) {
            return (
              <p className="mb-6 leading-relaxed text-base text-gf-text-primary dark:text-neutral-300" {...props}>
                {children}
              </p>
            );
          },
          strong({ node, children, ...props }: any) {
            return (
              <strong className="font-semibold text-gf-text-primary dark:text-neutral-100" {...props}>
                {children}
              </strong>
            );
          },
          em({ node, children, ...props }: any) {
            return (
              <em className="italic" {...props}>
                {children}
              </em>
            );
          },
          h1({ node, children, ...props }: any) {
            return (
              <h1 className="text-3xl font-bold mb-4 mt-8 text-gf-text-primary dark:text-neutral-100" {...props}>
                {children}
              </h1>
            );
          },
          h2({ node, children, ...props }: any) {
            return (
              <h2 className="text-2xl font-bold mb-3 mt-6 text-gf-text-primary dark:text-neutral-100" {...props}>
                {children}
              </h2>
            );
          },
          h3({ node, children, ...props }: any) {
            return (
              <h3 className="text-xl font-bold mb-2 mt-4 text-gf-text-primary dark:text-neutral-100" {...props}>
                {children}
              </h3>
            );
          },
          img({ node, ...props }: any) {
            return (
              <img
                {...props}
                className="rounded-lg shadow-md my-4"
                alt={props.alt || ""}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
