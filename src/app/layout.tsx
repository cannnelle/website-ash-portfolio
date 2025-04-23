import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { client } from "@/sanity/client";
import { urlForImage } from "@/sanity/image";
import type { Image as SanityImage } from 'sanity';

// Define SiteSettings structure
interface SiteSettingsData {
  siteTitle?: string;
  backgroundColor?: string;
  fontColor?: string;
  fontLinkColor?: string; // We might apply this via CSS variable
  favicon?: SanityImage;
}

// Fetch site settings
async function getSiteSettings(): Promise<SiteSettingsData | null> {
  const query = `*[_type == "siteSettings" && _id == "siteSettings"][0] {
    siteTitle,
    backgroundColor,
    fontColor,
    fontLinkColor,
    favicon { asset-> }
  }`;
  const settings = await client.fetch<SiteSettingsData>(query);
  return settings;
}

// Generate Metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const faviconUrl = urlForImage(settings?.favicon)?.size(32, 32).url(); 
  
  // Type guard to check if asset is resolved and has mimeType
  let faviconType: string | undefined;
  if (
    settings?.favicon?.asset && 
    typeof settings.favicon.asset === 'object' && 
    '_type' in settings.favicon.asset && 
    settings.favicon.asset._type === 'sanity.imageAsset' &&
    'mimeType' in settings.favicon.asset &&
    typeof settings.favicon.asset.mimeType === 'string' // Ensure it's a string
  ) {
    faviconType = settings.favicon.asset.mimeType;
  }

  return {
    title: settings?.siteTitle || "Ash Lopez Portfolio", 
    description: "Portfolio website",
    icons: faviconUrl ? [{ rel: 'icon', url: faviconUrl, type: faviconType }] : [], 
  };
}

// Optional: Add viewport settings (useful for theme-color)
// export async function generateViewport(): Promise<Viewport> {
//   const settings = await getSiteSettings();
//   return {
//     themeColor: settings?.backgroundColor || '#000000', // Set browser theme color
//   };
// }

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  // Prepare CSS variables
  const rootStyle: React.CSSProperties = {
    // Provide fallbacks just in case settings are missing
    '--color-background': settings?.backgroundColor || '#000000',
    '--color-text': settings?.fontColor || '#FFFFFF',
    '--color-link': settings?.fontLinkColor || '#FFFFFF', 
  } as React.CSSProperties; // Assert type for custom properties

  return (
    // Apply CSS variables to the html element
    <html lang="en" style={rootStyle}>
      <head>
        {/* Preconnect to Sanity CDN and API for faster asset/data loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://e6ti0bq7.api.sanity.io" />
        {/* Other head elements like meta tags, title (managed by Next.js metadata) */}
      </head>
      {/* Remove inline style from body */}
      <body className="antialiased">
        <Header /> 
        <main className="max-w-[1200px] mx-auto px-4 py-8">
          {children} 
        </main>
      </body>
    </html>
  );
}
