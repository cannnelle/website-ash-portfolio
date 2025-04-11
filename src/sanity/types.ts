import type { 
  Image as SanityImageOriginal, 
  PortableTextBlock as PortableTextBlockOriginal, 
  Slug as SlugOriginal, 
  Asset as SanityAssetOriginal,
  Reference 
} from 'sanity';

// Define a type for the image asset metadata we care about
export interface ImageAssetMetadata {
  lqip?: string; // Low-Quality Image Placeholder
  // Add other metadata fields if needed (dimensions, palette, etc.)
}

// Extend the default Sanity Asset type to include our metadata type
export interface ImageAsset extends SanityAssetOriginal {
  metadata?: ImageAssetMetadata;
}

// Redefine Image type to handle both reference and resolved asset
export interface Image extends Omit<SanityImageOriginal, 'asset'> { // Omit the original asset property
  asset?: Reference | ImageAsset; // Asset can be a Reference OR our extended ImageAsset
}

// Re-export other types for convenience
export type PortableTextBlock = PortableTextBlockOriginal;
export type Slug = SlugOriginal; 