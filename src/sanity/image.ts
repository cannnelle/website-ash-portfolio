import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

import { dataset, projectId } from './env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image | undefined) => {
  // Removed the check: if (!source?.asset?._ref) { return undefined }
  // Let the imageBuilder handle the source directly.
  // It needs the asset object, which should be present.
  if (!source?.asset) {
      // Add a basic check just for the asset object itself
      return undefined; 
  }
  
  return imageBuilder?.image(source).auto('format').fit('max')
} 