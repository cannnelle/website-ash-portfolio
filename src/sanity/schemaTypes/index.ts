import { type SchemaTypeDefinition } from 'sanity'
import project from './project' // Import the new project schema
import page from './page' // <-- Import the new generic page schema
import siteSettings from './siteSettings' // <-- Import settings

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [project, page, siteSettings], // <-- Add settings
}
