import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    // Re-using the Portable Text setup from aboutPage
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [ { title: 'Normal', value: 'normal' }, { title: 'H2', value: 'h2' }, { title: 'H3', value: 'h3' } ],
          lists: [ { title: 'Bullet', value: 'bullet' }, { title: 'Numbered', value: 'number' } ],
          marks: {
            decorators: [ { title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }, { title: 'Code', value: 'code' } ],
            annotations: [ { name: 'link', type: 'object', title: 'URL', fields: [ { title: 'URL', name: 'href', type: 'url' } ] } ],
          },
        },
        // Optional: Allow images within the body content itself
        // {
        //   type: 'image',
        //   options: { hotspot: true },
        // },
      ],
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image (Optional)',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'additionalImages',
      title: 'Additional Images (Optional)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    // --- Added Optional Contact Fields ---
    defineField({
      name: 'email',
      title: 'Email Address (Optional)',
      type: 'string',
      fieldset: 'contactDetails', // Group contact fields in the Studio
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number (Optional)',
      type: 'string',
      fieldset: 'contactDetails',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links (Optional)',
      type: 'array',
      fieldset: 'contactDetails',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'platform', title: 'Platform', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'url', title: 'URL', type: 'url', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'platform', subtitle: 'url' } },
        },
      ],
    }),
  ],
  // Define the fieldset for grouping
  fieldsets: [
    { name: 'contactDetails', title: 'Optional Contact Details' }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
    },
  },
}) 