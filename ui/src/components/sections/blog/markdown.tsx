/*
  A small Markdown renderer for article bodies.

  It returns React elements rather than an HTML string, so there is no
  dangerouslySetInnerHTML anywhere and nothing an author types can become live
  markup — React escapes text nodes by construction. That is also why this is
  hand-rolled instead of pulling in a parser plus a sanitiser: the articles need
  headings, emphasis, links and lists, and nothing here has to be sandboxed.

  Supported: # ## ###, - and 1. lists, > quote, **bold**, _italic_, `code`,
  [text](url), --- rule, and blank-line-separated paragraphs.
*/
import type { ReactNode } from 'react';

/** Inline spans. Split on the first matching delimiter, recurse on the rest. */
function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = key;

  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];

    if (token.startsWith('**')) {
      out.push(<strong key={i++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('_')) {
      out.push(<em key={i++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`')) {
      out.push(
        <code key={i++} className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const split = token.indexOf('](');
      const label = token.slice(1, split);
      const href = token.slice(split + 2, -1);
      // Only http(s), mailto and tel — an author pasting a javascript: URL should
      // not produce a working link.
      const safe = /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? href : '#';
      /* Case-insensitive: an author writing HTTPS:// would otherwise get a
         new-tab link without rel="noopener" — reverse tabnabbing. */
      const external = /^https?:/i.test(safe);
      out.push(
        <a
          key={i++}
          href={safe}
          className="underline underline-offset-2 hover:opacity-80"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>,
      );
    }
    last = m.index + token.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(
      <p key={key++} className="text-[15px] leading-7 text-muted-foreground">
        {inline(paragraph.join(' '))}
      </p>,
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <Tag
        key={key++}
        className={
          'ml-5 flex list-outside flex-col gap-1.5 text-[15px] leading-7 text-muted-foreground ' +
          (list.ordered ? 'list-decimal' : 'list-disc')
        }
      >
        {list.items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1]!.length;
      const content = inline(heading[2]!);
      const cls =
        level === 1
          ? 'mt-2 text-2xl font-semibold text-foreground'
          : level === 2
            ? 'mt-4 text-xl font-semibold text-foreground'
            : 'mt-3 text-lg font-medium text-foreground';
      blocks.push(
        level === 1 ? (
          <h2 key={key++} className={cls}>{content}</h2>
        ) : level === 2 ? (
          <h3 key={key++} className={cls}>{content}</h3>
        ) : (
          <h4 key={key++} className={cls}>{content}</h4>
        ),
      );
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      flushAll();
      blocks.push(<hr key={key++} className="my-2 border-border" />);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flushAll();
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-2 border-border pl-4 text-[15px] italic leading-7 text-muted-foreground"
        >
          {inline(quote[1]!)}
        </blockquote>,
      );
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      const item = (bullet ?? numbered)![1]!;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(item);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushAll();
  return <div className="flex flex-col gap-4">{blocks}</div>;
}
