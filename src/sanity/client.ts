import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion, // https://www.sanity.io/docs/api-versioning
  useCdn: false, 
  // set to 'true' for production environments that leverage edge caching
  // set to 'false' for faster build times and fresher data during development
  // We will set useCdn to true based on an environment variable for production builds later
}) 