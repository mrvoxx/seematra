// app/explore/[...slug]/page.tsx — Catch-all ISR route for pSEO pages
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPageBySlug, getRelatedPagesBySlug } from '@/lib/pseo/queries';
import { connectDB } from '@/lib/mongodb';
import PseoPage from '@/models/PseoPage';
import PageRenderer from '@/components/pseo/PageRenderer';
import JsonLd from '@/components/pseo/JsonLd';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://seematra.com';

// ISR: revalidate every 24 hours
export const revalidate = 86400;

// Pre-render only circuit hubs and top destinations at build time
export async function generateStaticParams() {
  try {
    await connectDB();
    const priorityPages = await PseoPage.find({
      status: 'published',
      page_type: { $in: ['circuit_hub', 'destination_guide'] },
    })
      .select('slug')
      .lean();

    return priorityPages.map((p) => ({
      slug: p.slug.split('/'),
    }));
  } catch {
    return [];
  }
}

// Dynamic metadata from CTR-optimized SEO fields
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug.join('/'));

  if (!page) {
    return {
      title: 'Page Not Found — Seematra',
      description: 'The page you are looking for does not exist.',
    };
  }

  return {
    title: page.seo.title,
    description: page.seo.meta_description,
    keywords: page.seo.secondary_keywords,
    alternates: {
      canonical: `${BASE_URL}/explore/${page.slug}`,
    },
    openGraph: {
      title: page.seo.title,
      description: page.seo.meta_description,
      type: 'article',
      url: `${BASE_URL}/explore/${page.slug}`,
      siteName: 'Seematra',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seo.title,
      description: page.seo.meta_description,
    },
  };
}

// Page component — delegates to type-specific renderers
export default async function ExplorePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug.join('/'));

  if (!page) {
    notFound();
  }

  // Fetch related pages for sidebar/footer
  const relatedSlugs = [
    ...page.internal_links.slice(0, 8).map((l: { slug: string }) => l.slug),
    ...page.related_pages.slice(0, 4).map((l: { slug: string }) => l.slug),
  ];
  const relatedPages = await getRelatedPagesBySlug([...new Set(relatedSlugs)], 12);

  // Serialize for client components
  const serializedPage = JSON.parse(JSON.stringify(page));
  const serializedRelated = JSON.parse(JSON.stringify(relatedPages));

  return (
    <>
      <JsonLd data={page.schema_markup} />
      <PageRenderer page={serializedPage} relatedPages={serializedRelated} />
    </>
  );
}
