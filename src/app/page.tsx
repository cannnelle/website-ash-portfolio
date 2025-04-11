'use client';

import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { urlForImage } from "@/sanity/image";
import type { Image as SanityImage, PortableTextBlock, Slug } from 'sanity';
import { useState, useEffect } from 'react';
import { PortableText } from '@portabletext/react';

interface Project {
  _id: string;
  title: string;
  slug: Slug;
  featuredImage: SanityImage & { asset?: { metadata?: { lqip?: string } } };
  date: string;
}

interface SiteDescriptionData {
  siteDescription?: PortableTextBlock[];
}

async function getFeaturedProjects(): Promise<Project[]> {
  const query = `*[_type == "project" && isFeatured == true] {
    _id,
    title,
    slug,
    featuredImage {..., asset->{..., metadata}},
    date
  } | order(date desc)`;
  const projects = await client.fetch(query);
  return projects;
}

async function getSiteDescription(): Promise<SiteDescriptionData | null> {
  const query = `*[_type == "siteSettings" && _id == "siteSettings"][0] {
    siteDescription
  }`;
  const data = await client.fetch<SiteDescriptionData>(query);
  return data;
}

const PortableTextLink = ({value, children}: {value?: {href?: string}, children: React.ReactNode}) => {
  const target = value?.href?.startsWith('http') ? '_blank' : undefined;
  const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
  return (
    <a href={value?.href} target={target} rel={rel} className="text-blue-400 hover:underline">
      {children}
    </a>
  );
};

export default function HomePage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [sortedProjects, setSortedProjects] = useState<Project[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alpha' | 'random'>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [siteDescription, setSiteDescription] = useState<PortableTextBlock[] | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [projects, descriptionData] = await Promise.all([
        getFeaturedProjects(),
        getSiteDescription()
      ]);
      setAllProjects(projects);
      setSortedProjects(projects);
      setSiteDescription(descriptionData?.siteDescription);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleSort = (order: typeof sortOrder) => {
    setSortOrder(order);
    let newSortedProjects = [...allProjects];

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
        newSortedProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    setSortedProjects(newSortedProjects);
  };

  return (
    <div>
      {siteDescription && (
        <div className="prose prose-invert max-w-none mb-8">
          <PortableText 
            value={siteDescription} 
            components={{ marks: { link: PortableTextLink } }}
          />
        </div>
      )}

      <h2 className="text-2xl mb-6">Featured Projects</h2>
      
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

      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {sortedProjects.map((project) => {
            const imageUrl = urlForImage(project.featuredImage)?.width(500).url();
            const lqip = project.featuredImage?.asset?.metadata?.lqip;
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
