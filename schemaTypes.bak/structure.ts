import { StructureBuilder } from 'sanity/structure'

export default (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('FAQs')
        .schemaType('faq')
        .child(S.documentTypeList('faq').title('FAQs')),

      S.listItem()
        .title('Authors')
        .schemaType('author')
        .child(S.documentTypeList('author').title('Authors')),

      S.listItem()
        .title('Categories')
        .schemaType('category')
        .child(S.documentTypeList('category').title('Categories')),

      // Add any additional content types here
    ])
