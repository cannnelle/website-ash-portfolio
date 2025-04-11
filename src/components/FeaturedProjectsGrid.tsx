'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/image";
import type { Image as SanityImage, Slug } from 'sanity';

// Re-define Project type here or import from a shared types file
interface Project {
  _id: string;
  title: string;
  slug: Slug;
  featuredImage: SanityImage & { asset?: { metadata?: { lqip?: string } } };
  date: string;
}

interface FeaturedProjectsGridProps {
  initialProjects: Project[];
}

export default function FeaturedProjectsGrid({ initialProjects }: FeaturedProjectsGridProps) {
  const [allProjects] = useState<Project[]>(initialProjects); // Store initial for re-sorting
  const [sortedProjects, setSortedProjects] = useState<Project[]>(initialProjects);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alpha' | 'random'>('newest');
  const [isLoading] = useState(false); // Loading is handled server-side initially

  const handleSort = (order: typeof sortOrder) => {
    setSortOrder(order);
    let newSortedProjects = [...allProjects]; // Sort from the original full list

    switch (order) {
      case 'newest':
        newSortedProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        newSortedProjects.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'alpha':
        newSortedProjects.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'random':
        newSortedProjects.sort(() => Math.random() - 0.5);
        break;
      default:
        // Default to newest if something goes wrong
        newSortedProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    setSortedProjects(newSortedProjects);
  };

  return (
    <div>
      {/* Sorting Controls */}
      <div className="mb-6 text-sm flex items-center justify-start space-x-4">
        <span>Sort by:</span>
        
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={() => handleSort('alpha')} 
            className={`transition-opacity duration-200 hover:opacity-60 ${sortOrder === 'alpha' ? 'underline' : ''}`}
          >
            Alphabetical
          </button>
          <button 
            onClick={() => handleSort('newest')} 
            className={`transition-opacity duration-200 hover:opacity-60 ${sortOrder === 'newest' ? 'underline' : ''}`}
          >
            Newest
          </button>
          <button 
            onClick={() => handleSort('oldest')} 
            className={`transition-opacity duration-200 hover:opacity-60 ${sortOrder === 'oldest' ? 'underline' : ''}`}
          >
            Oldest
          </button>
          <button 
            onClick={() => handleSort('random')} 
            className={`transition-opacity duration-200 hover:opacity-60 ${sortOrder === 'random' ? 'underline' : ''}`}
          >
            Random
          </button>
        </div>

        <div className="md:hidden relative">
          <select 
            value={sortOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSort(e.target.value as typeof sortOrder)}
            className="bg-[color:var(--color-background)] border border-neutral-600 text-[color:var(--color-text)] text-sm rounded-md focus:ring-gray-500 focus:border-gray-500 block w-full p-1.5 appearance-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alpha">Alphabetical</option>
            <option value="random">Random</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        // This should ideally not be shown as loading is handled server-side
        <p>Loading projects...</p> 
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {sortedProjects.map((project, index) => {
            const imageUrl = urlForImage(project.featuredImage)?.width(500).url();
            const lqip = project.featuredImage?.asset?.metadata?.lqip;
            const isFirstImage = index === 0; // Priority only for the very first image overall

            return (
              <Link href={`/project/${project.slug.current}`} key={project._id} className="group block relative">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={project.title || 'Project image'}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover aspect-square transition-opacity duration-300 ease-in-out group-hover:opacity-75"
                    placeholder={lqip ? "blur" : "empty"}
                    blurDataURL={lqip}
                    priority={isFirstImage}
                  />
                ) : (
                  <div className="aspect-square bg-gray-800 flex items-center justify-center">
                    <span>No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                  <h3 className="text-white text-lg font-semibold px-2 text-center">{project.title}</h3>
                </div>
              </Link>
            );
          })}
          {sortedProjects.length === 0 && !isLoading && <p>No featured projects found.</p>}
        </div>
      )}
    </div>
  );
} 