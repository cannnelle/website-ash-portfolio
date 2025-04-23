'use client'; // <-- Make it a client component

import { client } from '@/sanity/client';
import { urlForImage } from '@/sanity/image';
// Revert to standard types
import type { Image as SanityImage, Slug } from 'sanity'; 
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, use } from 'react'; // <-- Import hooks
import Lightbox from "yet-another-react-lightbox"; // <-- Import Lightbox
import "yet-another-react-lightbox/styles.css"; // <-- Import Lightbox styles

// Use standard Sanity types
interface ProjectDetails {
  _id: string;
  title: string;
  slug: Slug;
  description: string; // Assuming 'text' type in Sanity
  date: string;
  // Use standard SanityImage, the asset will be resolved by the query
  featuredImage: SanityImage & { asset?: { metadata?: { lqip?: string } } };
  additionalImages?: (SanityImage & { asset?: { metadata?: { lqip?: string } } })[]; // Optional array of images
  tags?: string[]; // Optional array of strings
}

// Function to fetch a single project by its slug
async function getProject(slug: string): Promise<ProjectDetails | null> {
  // Query fetches the project matching the slug
  // It uses projection to get related data like image details
  const query = `*[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    date,
    featuredImage {..., asset->{..., metadata}},
    additionalImages[] {..., asset->{..., metadata}}, // Get details for additional images
    tags
  }`;
  
  const project = await client.fetch<ProjectDetails>(query, { slug });
  return project;
}

// Props type for the page component
interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

// The Page Component (Async)
export default function ProjectPage(props: ProjectPageProps) {
  const params = use(props.params);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getProject(params.slug);
      if (!data) {
        // Trigger notFound on the client-side if data fetch fails
        // This requires a specific setup or redirect, a simple approach:
        console.error("Project not found, potentially redirect or show error message.");
        // Or use router.push('/404') if using useRouter hook
      } else {
        setProject(data);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [params.slug]);

  // If loading or project is null, show loading/error message
  if (isLoading) {
    return <p>Loading project...</p>; // Or a proper loading spinner
  }
  if (!project) {
    // Handle project not found state appropriately on client
    // This won't trigger Next.js's built-in 404 page directly from client-side
    return <p>Project not found.</p>; 
  }

  const featuredImageUrl = urlForImage(project.featuredImage)?.url();
  // Access placeholder directly, relying on optional chaining and query projection
  const featuredImageLqip = project.featuredImage?.asset?.metadata?.lqip;

  // Prepare slides for lightbox
  const lightboxSlides = [
    project.featuredImage, // Add featured image first
    ...(project.additionalImages || []) // Add additional images
  ]
  .filter(img => img?.asset) // Ensure images have assets
  .map(img => ({ 
      src: urlForImage(img)?.url() || '', // Ensure URL exists
      // Optional: Add more props like title, description if needed
  }));

  // Function to open lightbox at a specific image index
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <article>
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.title}</h1>
      
      {/* Date */}
      {project.date && (
        <p className="text-sm mb-6">
          {new Date(project.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      )}

      {/* Featured Image - Add onClick */}
      {featuredImageUrl && (
        <div className="mb-8 max-w-[600px]">
          <button onClick={() => openLightbox(0)} className="block w-full cursor-pointer">
            <Image 
              src={featuredImageUrl} 
              alt={project.title || 'Featured image'}
              width={1200} height={800} 
              className="w-full h-auto object-cover" 
              priority 
              placeholder={featuredImageLqip ? "blur" : "empty"} 
              blurDataURL={featuredImageLqip} 
            />
          </button>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="prose prose-invert max-w-none mb-8">
          <p>{project.description.split('\n').map((para, index) => <span key={index}>{para}<br/></span>)}</p>
        </div>
      )}

      {/* Additional Images Grid - Add onClick */}
      {project.additionalImages && project.additionalImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">More Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {project.additionalImages.map((image, index) => {
              if (!image?.asset) return null; 
              const imageUrl = urlForImage(image)?.width(600).url();
              const lqip = image.asset?.metadata?.lqip;
              let imageKey: string;
              if (typeof image._key === 'string' && image._key) {
                imageKey = image._key;
              } else if (typeof image.asset?._ref === 'string' && image.asset?._ref) {
                imageKey = image.asset._ref;
              } else {
                imageKey = `additional-img-${index}`;
              }

              return imageUrl ? (
                <button onClick={() => openLightbox(index + 1)} key={imageKey} className="block w-full cursor-pointer">
                  <Image
                    src={imageUrl}
                    alt={`Additional image for ${project.title}`}
                    width={600} height={600}
                    className="w-full h-auto object-cover aspect-square"
                    placeholder={lqip ? "blur" : "empty"}
                    blurDataURL={lqip}
                  />
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Link 
                href={`/tag/${encodeURIComponent(tag)}`} 
                key={tag}
                className="border border-neutral-600 text-sm font-medium px-3 py-1 rounded-full transition-opacity duration-200 hover:opacity-60"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Component */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        // Add plugins if needed (e.g., Captions, Thumbnails, Zoom)
      />
    </article>
  );
} 