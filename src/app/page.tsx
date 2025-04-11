import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/client";
import { urlForImage } from "@/sanity/image";
import type { Image as SanityImage, PortableTextBlock, Slug } from 'sanity';
import { PortableText } from '@portabletext/react';
import FeaturedProjectsGrid from '@/components/FeaturedProjectsGrid';

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

export default async function HomePage() {
  const [initialProjects, descriptionData] = await Promise.all([
    getFeaturedProjects(),
    getSiteDescription()
  ]);

  const siteDescription = descriptionData?.siteDescription;

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
      
      <FeaturedProjectsGrid initialProjects={initialProjects} />
    </div>
  );
}
