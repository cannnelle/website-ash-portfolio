import { client } from '@/sanity/client';
import { urlForImage } from '@/sanity/image';
import type { Image as SanityImage, Slug } from 'sanity';
import Image from 'next/image';
import Link from 'next/link';

// Revalidate this page every 60 seconds
export const revalidate = 60;

// Use standard Sanity types
interface Project {
  _id: string;
  title: string;
  slug: Slug;
  featuredImage: SanityImage & { asset?: { metadata?: { lqip?: string } } }; // Hint resolved asset
}

// Function to fetch projects by tag
async function getProjectsByTag(tag: string): Promise<Project[]> {
  // Query fetches projects where the tags array contains the specified tag
  const query = `*[_type == "project" && $tag in tags[]] | order(date desc) {
    _id,
    title,
    slug,
    featuredImage {..., asset->{..., metadata}}
  }`;
  const params = { tag }; 
  // Cast params to Record<string, unknown> to bypass strict overload checking
  const projects = await client.fetch<Project[]>(query, params as Record<string, unknown>);
  return projects;
}

// Props type for the page component
interface TagPageProps {
  params: Promise<{ tag: string }>;
}

// The Page Component (Async)
export default async function TagPage(props: TagPageProps) {
  const params = await props.params;
  // Decode the tag from the URL parameter (it might be URL-encoded)
  const decodedTag = decodeURIComponent(params.tag);
  const projects = await getProjectsByTag(decodedTag);

  return (
    <div>
      {/* Display the tag being filtered */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Projects tagged with: <span className="font-normal">{decodedTag}</span>
      </h1>

      {/* Responsive Project Grid (same as home page) */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {projects.map((project) => {
            const imageUrl = urlForImage(project.featuredImage)?.width(500).url(); 
            // Get placeholder
            const lqip = project.featuredImage?.asset?.metadata?.lqip;
            return (
              <Link 
                href={`/project/${project.slug.current}`} 
                key={project._id} 
                className="group block relative"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={project.title || 'Project image'}
                    width={500} 
                    height={500} 
                    className="w-full h-auto object-cover aspect-square transition-opacity duration-300 ease-in-out group-hover:opacity-75"
                    placeholder={lqip ? "blur" : "empty"}
                    blurDataURL={lqip}
                  />
                ) : (
                  <div className="aspect-square bg-gray-800 flex items-center justify-center">
                    <span>No Image</span>
                  </div>
                )}
                {/* Title appears on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                  <h3 className="text-white text-lg font-semibold px-2 text-center">{project.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p>{`No projects found for ${decodedTag}`}</p>
      )}
    </div>
  );
} 