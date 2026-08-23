/*
  The three newest articles, shown on the home page below the testimonials.

  Returns null when nothing is published, so the band — and the gap it would
  leave — disappears entirely and the page reads as though the blog were never
  built. The home page wraps it accordingly.

  Layout follows the reviews band it sits under: same container width, same
  eyebrow rule, same card shell. The tint alternates to bg-background because
  reviews is bg-muted/40 and two identical bands touching reads as one.
*/
import { cn } from '@/lib/utils';
import { useSiteContent } from '@/lib/content';
import { blogHref } from './blog-pages';

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

export function RecentArticles({ className }: { className?: string }) {
  const { blogs } = useSiteContent();
  if (blogs.length === 0) return null;

  const recent = blogs.slice(0, 3);

  return (
    <section className={cn('w-full bg-background', className)}>
      <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            News &amp; insight
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            <span className="box-decoration-clone bg-[linear-gradient(transparent_62%,rgb(0_128_198/0.3)_62%)]">
              From the desk
            </span>
          </h2>
          <a
            href="#blog"
            className="text-[15px] font-medium text-primary underline-offset-4 hover:underline"
          >
            All articles →
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((post) => (
            <a
              key={post.id}
              href={blogHref(post.slug)}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              {post.coverImage && (
                <div className="aspect-16/10 overflow-hidden bg-muted">
                  <img
                    src={post.coverImage}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-6">
                {post.publishedAt && (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {formatDate(post.publishedAt)}
                  </span>
                )}
                <h3 className="text-lg font-semibold leading-snug text-foreground">{post.title}</h3>
                {post.excerpt && (
                  <p className="line-clamp-3 text-[15px] leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
