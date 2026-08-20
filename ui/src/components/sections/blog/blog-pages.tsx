/* The articles index and a single article, both inside the site chrome. */
import { BLOG_NAV_INDEX, SiteHeader } from '@/components/ui/navbar/site-header';
import { SiteFooter } from '@/components/sections/footer/site-footer';
import { Markdown } from './markdown';
import { useBlogPost, useSiteContent, type BlogSummary } from '@/lib/content';

export const blogPageId = (slug: string) => `blog-${slug}`;
export const blogHref = (slug: string) => `#${blogPageId(slug)}`;

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh scroll-smooth bg-background">
      <SiteHeader activeIndex={BLOG_NAV_INDEX} />
      {children}
      <SiteFooter />
    </div>
  );
}

function Card({ post }: { post: BlogSummary }) {
  return (
    <a
      href={blogHref(post.slug)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-16/10 overflow-hidden bg-muted">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.publishedAt && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {formatDate(post.publishedAt)}
          </span>
        )}
        <h3 className="text-lg font-medium text-foreground">{post.title}</h3>
        {post.excerpt && (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        )}
      </div>
    </a>
  );
}

export function BlogIndexPage() {
  const { blogs, loading } = useSiteContent();

  return (
    <Shell>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <header className="mb-10 flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">News &amp; insight</h1>
          <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground">
            Notes on the Gurugram market, paperwork and what we are seeing on the ground.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : blogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing published yet — please check back shortly.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <Card key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

export function BlogArticlePage({ slug }: { slug: string }) {
  const { post, loading } = useBlogPost(slug);

  return (
    <Shell>
      <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <a
          href="#blog"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← All articles
        </a>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : !post ? (
          <div className="mt-8">
            <h1 className="text-2xl font-semibold text-foreground">Article not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              It may have been removed, or the link may be wrong.
            </p>
          </div>
        ) : (
          <>
            <header className="mt-6 flex flex-col gap-3">
              {post.publishedAt && (
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {formatDate(post.publishedAt)}
                </span>
              )}
              <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-[15px] leading-7 text-muted-foreground">{post.excerpt}</p>
              )}
            </header>

            {post.coverImage && (
              <img
                src={post.coverImage}
                alt=""
                className="mt-8 w-full rounded-2xl border border-border object-cover"
              />
            )}

            <div className="mt-8">
              <Markdown source={post.body} />
            </div>
          </>
        )}
      </article>
    </Shell>
  );
}
