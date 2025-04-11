import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .id('__root__')
    .title('Content')
    .items([
      // Add Site Settings singleton
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .icon(() => '⚙️') // Example icon
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings') // Use fixed ID
            .title('Edit Site Settings')
        ),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'), // Add generic Page type
      S.divider(),
      S.documentTypeListItem('project').title('Projects'),
      // Add other document types here if needed
    ])
