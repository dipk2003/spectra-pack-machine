import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock3,
  FolderOpen,
  PackageOpen,
} from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import GuideInquiryForm from '@/components/forms/GuideInquiryForm';
import { parseBlogTemplateContent } from '@/lib/blog-template';
import { buildAbsoluteSeoTitle, buildMetaDescription } from '@/lib/seo';
import { getCategoryById, getProductById, listProducts, listServices } from '@/lib/cms';
import { getPublicBlogBySlug } from '@/lib/public-blogs';
import { EDITORIAL_GUIDES, getEditorialGuide } from '@/lib/editorial-guides';
import { resolveGuideHref, resolveGuideProduct } from '@/lib/editorial-links';
import { categoryToSlug } from '@/lib/categories';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import { COMPANY_INFO } from '@/lib/data';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}
type ArticleBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; title?: string; items: string[] };

const LIST_MARKER_PATTERN = /^((?:[-*•+]|✓)\s+|\d+[.)]\s+)/;

const normalizeLine = (line: string) => {
  const cleaned = line.replace(/\s+/g, ' ').trim();

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith('“') && cleaned.endsWith('”')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    return cleaned.slice(1, -1).trim();
  }

  return cleaned;
};

const stripListMarker = (line: string) => normalizeLine(line.replace(LIST_MARKER_PATTERN, ''));

const normalizeGuideLabel = (value: string) =>
  normalizeLine(value.replace(/[?:]+$/, '').replace(/^What\s+(?:Are|Is)\s+/i, ''));

const truncateText = (value: string, limit: number) => {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, Math.max(0, limit - 1)).trimEnd()}...`;
};

const isHeadingLine = (line: string) => /\?$/.test(line) && line.length <= 120;

const isListTitleLine = (line: string) => /:$/.test(line) && line.length <= 80;

const isExplicitListItem = (line: string) => LIST_MARKER_PATTERN.test(line);

const isCompactListLine = (line: string) =>
  line.length <= 78 && !/[.!?]$/.test(line) && !isHeadingLine(line) && !isListTitleLine(line);

function buildArticleBlocks(lines: string[]): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = normalizeLine(lines[index] || '');

    if (!line) {
      continue;
    }

    if (isHeadingLine(line)) {
      blocks.push({ type: 'heading', text: line });
      continue;
    }

    if (isListTitleLine(line)) {
      const items: string[] = [];
      let cursor = index + 1;

      while (cursor < lines.length) {
        const nextLine = normalizeLine(lines[cursor] || '');

        if (!nextLine) {
          cursor += 1;
          continue;
        }

        if (isHeadingLine(nextLine) || isListTitleLine(nextLine)) {
          break;
        }

        if (isExplicitListItem(nextLine) || isCompactListLine(nextLine)) {
          items.push(stripListMarker(nextLine));
          cursor += 1;
          continue;
        }

        break;
      }

      if (items.length >= 2) {
        blocks.push({
          type: 'list',
          title: normalizeGuideLabel(stripListMarker(line)),
          items,
        });
        index = cursor - 1;
        continue;
      }
    }

    if (isExplicitListItem(line)) {
      const items = [stripListMarker(line)];
      let cursor = index + 1;

      while (cursor < lines.length) {
        const nextLine = normalizeLine(lines[cursor] || '');

        if (!nextLine || !isExplicitListItem(nextLine)) {
          break;
        }

        items.push(stripListMarker(nextLine));
        cursor += 1;
      }

      blocks.push({ type: 'list', items });
      index = cursor - 1;
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  return blocks;
}

function buildGuideItems(blocks: ArticleBlock[], fallback: string) {
  const items = blocks
    .flatMap((block) => {
      if (block.type === 'heading') {
        return [normalizeGuideLabel(block.text)];
      }

      if (block.type === 'list' && block.title) {
        return [normalizeGuideLabel(block.title)];
      }

      if (block.type === 'paragraph' && block.text.length > 54) {
        return [truncateText(block.text, 96)];
      }

      return [] as string[];
    })
    .map((item) => normalizeLine(item))
    .filter(Boolean);

  const uniqueItems = Array.from(new Set(items)).slice(0, 4);

  if (uniqueItems.length > 0) {
    return uniqueItems;
  }

  return [truncateText(normalizeLine(fallback), 96)];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  noStore();

  try {
    const blog = await getPublicBlogBySlug(params.slug);
    if (!blog) return {};
    return {
      title: { absolute: buildAbsoluteSeoTitle(blog.seoTitle, blog.title) },
      description: buildMetaDescription(blog.seoDesc, blog.excerpt),
      alternates: { canonical: `/blog/${blog.slug}` },
      robots: { index: true, follow: true },
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        url: `/blog/${blog.slug}`,
        type: 'article',
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt,
        images: blog.image ? [{ url: blog.image, alt: blog.title }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.excerpt,
        images: blog.image ? [blog.image] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  noStore();

  const blog = await getPublicBlogBySlug(params.slug);
  if (!blog || !blog.published) notFound();

  const layout = parseBlogTemplateContent(blog.content || '');
  const [categoryRecord, productRecord, catalog, services] = await Promise.all([
    blog.categoryId ? getCategoryById(blog.categoryId, { access: 'public' }) : Promise.resolve(null),
    blog.featuredProductId ? getProductById(blog.featuredProductId, { access: 'public' }) : Promise.resolve(null),
    listProducts({ publishedOnly: true, access: 'public' }).catch(() => []),
    listServices({ publishedOnly: true, access: 'public' }).catch(() => []),
  ]);
  const relatedCategory = categoryRecord?.published ? categoryRecord : null;
  const relatedProduct = productRecord?.published ? productRecord : null;
  const guideRecord = getEditorialGuide(blog.slug);
  const guide = guideRecord?.id === blog.id ? guideRecord : null;
  const guideProducts = Array.from(new Map((guide?.productSlugs || [])
    .map((slug) => resolveGuideProduct(slug, catalog))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map((product) => [product.slug, product])).values());
  const guideServices = services.filter((service) => guide?.serviceSlugs.includes(service.slug));
  const relatedGuides = EDITORIAL_GUIDES.filter((article) => guide?.relatedGuideSlugs.includes(article.slug));
  const guideCategories = Array.from(new Map(guideProducts.map((product) => [
    product.categorySlug || categoryToSlug(product.category), product.category,
  ])).entries());
  const inlineContent = (text: string) => text.split(/(\[[^\]\n]+\]\(\/[^\s)]+\))/g).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((\/[^\s)]+)\)$/);
    if (!match) return part;
    const href = resolveGuideHref(match[2], catalog, services.map((service) => service.slug));
    return href ? <Link key={`${index}-${href}`} href={href}>{match[1]}</Link> : match[1];
  });

  const contentLines = (layout.body || blog.excerpt)
    .split('\n')
    .map((line) => normalizeLine(line))
    .filter(Boolean);
  const articleBlocks = buildArticleBlocks(contentLines);
  const leadIndex = articleBlocks.findIndex((block) => block.type === 'paragraph');
  const leadParagraph =
    leadIndex >= 0 && articleBlocks[leadIndex]?.type === 'paragraph'
      ? articleBlocks[leadIndex].text
      : blog.excerpt;
  const renderedBlocks = articleBlocks.filter((_, index) => index !== leadIndex);
  const guideItems = buildGuideItems(articleBlocks, blog.excerpt);
  const publishedOn = new Date(blog.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const wordCount = [blog.title, blog.excerpt, layout.body].join(' ').trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(2, Math.ceil(wordCount / 180));
  const articleKind = blog.title.includes(' vs ') ? 'Comparison guide' : 'Packaging insight';
  const hasRelatedLinks = Boolean(relatedCategory || relatedProduct);
  const visuals = [
    layout.leftImage
      ? {
          src: layout.leftImage,
          alt: layout.leftImageAlt || `${blog.title} visual`,
        }
      : null,
    layout.rightImage
      ? {
          src: layout.rightImage,
          alt: layout.rightImageAlt || `${blog.title} visual`,
        }
      : null,
  ].filter((value): value is { src: string; alt: string } => Boolean(value));
  const articleUrl = `${COMPANY_INFO.website}/blog/${blog.slug}`;
  const articleImage = blog.image
    ? blog.image.startsWith('http')
      ? blog.image
      : `${COMPANY_INFO.website}${blog.image.startsWith('/') ? '' : '/'}${blog.image}`
    : undefined;
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt,
      image: articleImage,
      url: articleUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt,
      author: { '@type': 'Organization', name: COMPANY_INFO.name, url: COMPANY_INFO.website },
      publisher: {
        '@type': 'Organization',
        name: COMPANY_INFO.name,
        url: COMPANY_INFO.website,
        logo: {
          '@type': 'ImageObject',
          url: `${COMPANY_INFO.website}${COMPANY_INFO.logoPath}`,
        },
      },
      inLanguage: 'en-IN',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: COMPANY_INFO.website },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${COMPANY_INFO.website}/blog` },
        { '@type': 'ListItem', position: 3, name: blog.title, item: articleUrl },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <section
        className={styles.hero}
        style={{
          backgroundImage: `url(${blog.image})`,
        }}
      >
        <div className="container">
          <AnimatedSection className={styles.heroShell}>
            <Link href="/blog" className={styles.backLink}>
              <ArrowLeft size={16} /> Back to Blog
            </Link>

            <div className={styles.heroGrid}>
              <div className={styles.heroMain}>
                <div className={styles.heroMeta}>
                  <span className={styles.heroBadge}>Spectra Pack Blog</span>
                  {relatedCategory ? (
                    <span className={styles.heroTag}>
                      <FolderOpen size={14} /> {relatedCategory.name}
                    </span>
                  ) : null}
                  {relatedProduct ? (
                    <span className={styles.heroTag}>
                      <PackageOpen size={14} /> {relatedProduct.title}
                    </span>
                  ) : null}
                </div>

                <h1 className={styles.heroTitle}>{blog.title}</h1>
                <p className={styles.heroExcerpt}>{blog.excerpt}</p>

                <div className={styles.heroFacts}>
                  <div className={styles.factCard}>
                    <Calendar size={18} />
                    <div>
                      <span className={styles.factLabel}>Published</span>
                      <strong className={styles.factValue}>{publishedOn}</strong>
                    </div>
                  </div>

                  <div className={styles.factCard}>
                    <Clock3 size={18} />
                    <div>
                      <span className={styles.factLabel}>Read time</span>
                      <strong className={styles.factValue}>{readTime} min read</strong>
                    </div>
                  </div>

                  <div className={styles.factCard}>
                    <FolderOpen size={18} />
                    <div>
                      <span className={styles.factLabel}>Format</span>
                      <strong className={styles.factValue}>{articleKind}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <aside className={styles.heroAside}>
                <div className={styles.heroPanel}>
                  <span className={styles.panelEyebrow}>Inside this article</span>
                  <p className={styles.panelTitle}>
                    Scan the main points first, then dive into the full breakdown below.
                  </p>

                  <ul className={styles.summaryList}>
                    {guideItems.map((item, index) => (
                      <li key={`${blog.id}-summary-${index}`}>{item}</li>
                    ))}
                  </ul>

                  {hasRelatedLinks ? (
                    <div className={styles.heroPanelLinks}>
                      {relatedProduct ? (
                        <Link href={`/products/${relatedProduct.slug}`} className={styles.panelLink}>
                          <span className={styles.panelLinkText}>
                            <span className={styles.panelLinkLabel}>Related product</span>
                            <strong className={styles.panelLinkValue}>{relatedProduct.title}</strong>
                          </span>
                          <ArrowRight size={16} />
                        </Link>
                      ) : null}

                      {relatedCategory ? (
                        <Link
                          href={`/products/category/${relatedCategory.slug}`}
                          className={styles.panelLink}
                        >
                          <span className={styles.panelLinkText}>
                            <span className={styles.panelLinkLabel}>Related category</span>
                            <strong className={styles.panelLinkValue}>{relatedCategory.name}</strong>
                          </span>
                          <ArrowRight size={16} />
                        </Link>
                      ) : null}
                    </div>
                  ) : (
                    <Link href="/blog" className={styles.panelBrowseLink}>
                      Browse more packaging guides <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </aside>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className={styles.articleSection}>
        <div className={`container ${styles.articleContainer}`}>
          <div className={styles.articleGrid}>
            <AnimatedSection className={styles.articleRail} direction="left">
              <div className={styles.railStack}>
                <div className={styles.railCard}>
                  <span className={styles.railEyebrow}>Quick summary</span>
                  <h2 className={styles.railTitle}>What this guide covers</h2>

                  <ul className={styles.railSummaryList}>
                    {guideItems.map((item, index) => (
                      <li key={`${blog.id}-rail-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                {visuals.length > 0 ? (
                  <div className={styles.visualStack}>
                    {visuals.map((visual, index) => (
                      <div key={`${visual.src}-${index}`} className={styles.sideVisualCard}>
                        <div className={styles.sideVisualFrame}>
                          <Image
                            src={visual.src}
                            alt={visual.alt}
                            fill
                            className={styles.sideVisualImage}
                            sizes="(max-width: 1100px) 50vw, 320px"
                            unoptimized={shouldBypassNextImageOptimization(visual.src)}
                          />
                        </div>
                        <div className={styles.sideVisualCaption}>{visual.alt}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {hasRelatedLinks ? (
                  <div className={styles.railCard}>
                    <span className={styles.railEyebrow}>Explore next</span>
                    <div className={styles.railActions}>
                      {relatedProduct ? (
                        <Link href={`/products/${relatedProduct.slug}`} className={styles.railAction}>
                          <span className={styles.railActionMeta}>
                            <span className={styles.railActionLabel}>Machine</span>
                            <strong className={styles.railActionValue}>{relatedProduct.title}</strong>
                          </span>
                          <ArrowRight size={16} />
                        </Link>
                      ) : null}

                      {relatedCategory ? (
                        <Link
                          href={`/products/category/${relatedCategory.slug}`}
                          className={styles.railAction}
                        >
                          <span className={styles.railActionMeta}>
                            <span className={styles.railActionLabel}>Category</span>
                            <strong className={styles.railActionValue}>{relatedCategory.name}</strong>
                          </span>
                          <ArrowRight size={16} />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up">
              <article className={styles.articleCard}>
                <div className={styles.articleLead}>
                  <span className={styles.articleLeadLabel}>Overview</span>
                  <p>{inlineContent(leadParagraph)}</p>
                </div>

                <div className={styles.articleFlow}>
                  {renderedBlocks.length > 0 ? (
                    renderedBlocks.map((block, index) => {
                      if (block.type === 'heading') {
                        return (
                          <h2 key={`${blog.id}-heading-${index}`} className={styles.articleHeading}>
                            {block.text}
                          </h2>
                        );
                      }

                      if (block.type === 'list') {
                        return (
                          <section key={`${blog.id}-list-${index}`} className={styles.articleList}>
                            {block.title ? (
                              <h3 className={styles.articleListTitle}>{block.title}</h3>
                            ) : null}
                            <ul className={styles.articleListItems}>
                              {block.items.map((item, itemIndex) => (
                                <li key={`${blog.id}-list-item-${index}-${itemIndex}`}>{inlineContent(item)}</li>
                              ))}
                            </ul>
                          </section>
                        );
                      }

                      return (
                        <p key={`${blog.id}-paragraph-${index}`} className={styles.articleParagraph}>
                          {inlineContent(block.text)}
                        </p>
                      );
                    })
                  ) : (
                    <p className={styles.articleParagraph}>{blog.excerpt}</p>
                  )}
                </div>
              </article>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {guide ? (
        <section className={styles.resourcesSection} aria-label="Related machines and guides">
          <div className="container">
            <h2>Explore the machines and services in this guide</h2>
            <div className={styles.resourceGrid}>
              {guideProducts.map((product) => (
                <Link key={product.slug} href={`/products/${product.slug}`} className={styles.resourceCard}>
                  <strong>{product.title}</strong><span>View machine details <ArrowRight size={15} /></span>
                </Link>
              ))}
              {guideServices.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`} className={styles.resourceCard}>
                  <strong>{service.title}</strong><span>Explore service scope <ArrowRight size={15} /></span>
                </Link>
              ))}
            </div>
            <div className={styles.categoryLinks}>
              {guideCategories.map(([slug, name]) => <Link key={slug} href={`/products/category/${slug}`}>Browse {name}</Link>)}
            </div>
            {relatedGuides.length ? (
              <div className={styles.relatedGuides}>
                <h3>Continue reading</h3>
                {relatedGuides.map((article) => <Link key={article.slug} href={`/blog/${article.slug}`}>{article.title} <ArrowRight size={15} /></Link>)}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <GuideInquiryForm guideSlug={blog.slug} guideTitle={blog.title} productSlug={relatedProduct?.slug || guideProducts[0]?.slug || ''} />

      <section className={styles.ctaSection}>
        <div className="container">
          <AnimatedSection>
            <div className={styles.ctaCard}>
              <div className={styles.ctaContent}>
                <span className={styles.ctaLabel}>Next step</span>
                <h2 className={styles.ctaTitle}>
                  {hasRelatedLinks
                    ? 'Continue with a relevant machine or category'
                    : 'Keep exploring packaging guides for better buying decisions'}
                </h2>
                <p className={styles.ctaText}>
                  {hasRelatedLinks
                    ? 'Jump straight into the related machine pages, or go back to the full blog library to compare more packaging options.'
                    : 'Browse more articles to compare machine types, workflows, and packaging methods before you decide.'}
                </p>
              </div>

              <div className={styles.ctaActions}>
                {relatedProduct ? (
                  <Link href={`/products/${relatedProduct.slug}`} className="btn btn-white">
                    View Product <ArrowRight size={16} />
                  </Link>
                ) : null}

                {relatedCategory ? (
                  <Link href={`/products/category/${relatedCategory.slug}`} className="btn btn-accent">
                    View Category <ArrowRight size={16} />
                  </Link>
                ) : null}

                <Link href="/blog" className={styles.ctaGhost}>
                  More Articles <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

