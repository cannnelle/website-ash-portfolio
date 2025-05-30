import Link from 'next/link';
import { client } from '@/sanity/client';
import Navigation from './Navigation'; // We'll create this Client Component next

// Updated structure for page nav items
interface PageNavItemData {
  _type: 'page'; // Explicitly page type
  title?: string;
  slug?: { current: string }; // Need slug for href
}

interface NavLink {
  title: string;
  href: string;
}

// Interface for Site Settings
interface SiteSettingsData {
  siteTitle?: string;
}

// Fetch navigation data (all published pages)
async function getNavData(): Promise<PageNavItemData[]> {
  // Fetch all documents of type 'page' that have a slug
  const query = `*[_type == "page" && defined(slug.current)] {
    _type,
    title,
    slug
  }`;
  // Add ordering if needed, e.g. | order(title asc)
  const data = await client.fetch<PageNavItemData[]>(query);
  return data;
}

// Fetch site settings
async function getSiteSettings(): Promise<SiteSettingsData> {
  const query = `*[_type == "siteSettings"][0] { siteTitle }`;
  const settings = await client.fetch<SiteSettingsData>(query);
  return settings || {}; // Return empty object if no settings found
}

export default async function Header() {
  // Fetch both sets of data concurrently
  const [navData, siteSettings] = await Promise.all([
    getNavData(),
    getSiteSettings()
  ]);

  const siteTitle = siteSettings.siteTitle || 'Ash Lopez'; // Use fetched title or fallback

  // Build navigation links array from fetched pages
  const navLinks: NavLink[] = [
    { title: 'Work', href: '/' }, // Static link for home/work
    ...navData
      .map(item => {
        // Use slug for href, fallback title
        const href = item.slug?.current ? `/${item.slug.current}` : null;
        return href ? { title: item.title || item.slug?.current || 'Untitled Page', href } : null;
      })
      .filter((item): item is NavLink => item !== null)
      .sort((a, b) => {
        // Define desired order (e.g., Work, About, Contact)
        // This relies on slugs being consistent ('/about', '/contact')
        const order = ['/', '/about', '/contact'];
        return order.indexOf(a.href) - order.indexOf(b.href);
      }),
  ];

  return (
    <header className="py-4">
      <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center">
        {/* Make H1 clickable link to home */}
        <h1 className="text-lg font-semibold">
          <Link href="/" className="hover:opacity-60 transition-colors">
            {siteTitle} {/* Use the fetched site title */}
          </Link>
        </h1>
        {/* Pass generated links to the Navigation client component */}
        <Navigation navLinks={navLinks} />
      </div>
    </header>
  );
} 