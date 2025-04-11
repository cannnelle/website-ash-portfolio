import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      description: 'The main title displayed in the browser tab and potentially the header.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description / Intro',
      description: 'Optional text displayed on the home page before the projects.',
      type: 'array', // Use Portable Text for basic formatting
      of: [{ type: 'block', styles: [{title: 'Normal', value: 'normal'}], lists: [], marks: {decorators: [{title: 'Strong', value: 'strong'}, {title: 'Emphasis', value: 'em'}], annotations: []} }],
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Site background color (e.g., #000000 or black).',
      initialValue: '#000000',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fontColor',
      title: 'Default Font Color',
      type: 'string',
      description: 'Main text color (e.g., #FFFFFF or white).',
      initialValue: '#FFFFFF',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fontLinkColor',
      title: 'Link Color',
      type: 'string',
      description: 'Default color for links (e.g., #FFFFFF or #60a5fa).',
      initialValue: '#FFFFFF',
      validation: (Rule) => Rule.required(),
      // Consider adding a color picker plugin later if desired
    }),
    defineField({
        name: 'favicon',
        title: 'Favicon',
        type: 'image',
        description: 'Upload a square image (e.g., .png, .ico, .svg) to be used as the browser tab icon.',
        options: {
            accept: 'image/png, image/x-icon, image/svg+xml, image/webp'
        }
    }),
    // Note: Project grid columns are kept in Tailwind classes (page.tsx) for reliability with JIT compilation.
  ],
  preview: {
    prepare() {
      // Hardcoded preview title
      return { title: 'Site Settings' }
    }
  }
}) 