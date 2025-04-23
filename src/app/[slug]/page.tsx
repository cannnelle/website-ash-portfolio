import { client } from '@/sanity/client';
import { urlForImage } from '@/sanity/image';
import type { Image as SanityImage, PortableTextBlock, Slug } from 'sanity';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Revalidate this page every 60 seconds
export const revalidate = 60;

// Interface for generic Page data
interface PageData {
  _id: string;
  title: string;
  slug: Slug;
  body?: PortableTextBlock[];
  featuredImage?: SanityImage & { asset?: { metadata?: { lqip?: string } } };
  additionalImages?: (SanityImage & { asset?: { metadata?: { lqip?: string } } })[];
  email?: string;
  phoneNumber?: string;
  socialLinks?: { 
    _key: string;
    platform: string; 
    url: string; 
  }[];
}

// Fetch page data by slug
async function getPageData(slug: string): Promise<PageData | null> {
  const query = `*[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    featuredImage {..., asset->{..., metadata}},
    additionalImages[] {..., asset->{..., metadata}},
    email,
    phoneNumber,
    socialLinks
  }`;
  const page = await client.fetch<PageData>(query, { slug });
  return page;
}

// Re-use PortableTextLink component
const PortableTextLink = ({ value, children }: { value?: { href?: string }; children: React.ReactNode }) => {
  const target = value?.href?.startsWith('http') ? '_blank' : undefined;
  const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
  return (
    <a href={value?.href} target={target} rel={rel} className="text-blue-400 hover:underline">
      {children}
    </a>
  );
};

// Props for the page component
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generic Page Component
export default async function Page(props: PageProps) {
  const params = await props.params;
  const page = await getPageData(params.slug);

  if (!page) {
    notFound();
  }

  const featuredImageUrl = urlForImage(page.featuredImage)?.url();
  const featuredImageLqip = page.featuredImage?.asset?.metadata?.lqip;
  const hasContactDetails = page.email || page.phoneNumber || (page.socialLinks && page.socialLinks.length > 0);

  return (
    <article className="space-y-8">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold">{page.title}</h1>
      {/* Optional Featured Image */}
      {featuredImageUrl && (
        <div className="mb-8 max-w-[600px]"> {/* Consistent with project page */}
          <Image
            src={featuredImageUrl}
            alt={page.title || 'Featured image'}
            width={1200}
            height={800}
            className="w-full h-auto object-cover"
            priority
            placeholder={featuredImageLqip ? "blur" : "empty"}
            blurDataURL={featuredImageLqip}
          />
        </div>
      )}
      {/* Body Content */}
      {page.body && (
        <div className="prose prose-invert max-w-none">
          <PortableText
            value={page.body}
            components={{ marks: { link: PortableTextLink } }}
          />
        </div>
      )}
      {/* Optional Additional Images Grid */}
      {page.additionalImages && page.additionalImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">More Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {page.additionalImages.map((image, index) => {
              if (!image) return null;
              const imageUrl = urlForImage(image)?.width(600).url();
              const lqip = image.asset?.metadata?.lqip;
              let imageKey: string;
              if (typeof image._key === 'string' && image._key) { imageKey = image._key; }
              else if (typeof image.asset?._ref === 'string' && image.asset?._ref) { imageKey = image.asset._ref; }
              else { imageKey = `additional-img-${index}`; }

              return imageUrl ? (
                <Image
                  key={imageKey}
                  src={imageUrl}
                  alt={`Additional image for ${page.title}`}
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover aspect-square"
                  placeholder={lqip ? "blur" : "empty"}
                  blurDataURL={lqip}
                />
              ) : null;
            })}
          </div>
        </div>
      )}
      {/* --- Conditionally Render Contact Details --- */}
      {hasContactDetails && (
        <div className="pt-8 border-t border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">Contact Details</h2>
          <div className="space-y-4">
            {page.email && (
              <div>
                <h3 className="text-xl font-semibold mb-1">Email</h3>
                <a href={`mailto:${page.email}`} className="hover:opacity-60 hover:underline">
                  {page.email}
                </a>
              </div>
            )}

            {page.phoneNumber && (
              <div>
                <h3 className="text-xl font-semibold mb-1">Phone</h3>
                <a href={`tel:${page.phoneNumber.replace(/\D/g, '')}`} className="hover:opacity-60 hover:underline">
                  {page.phoneNumber}
                </a>
              </div>
            )}

            {page.socialLinks && page.socialLinks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Elsewhere</h3>
                <ul className="list-none space-y-2 pl-0">
                  {page.socialLinks.map((link) => (
                    <li key={link._key}>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:opacity-60 hover:underline"
                      >
                        {link.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
} 