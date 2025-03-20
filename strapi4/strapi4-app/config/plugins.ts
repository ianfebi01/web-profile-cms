export default ({ env }) => ({
  upload:
    env("CLOUDINARY_KEY", null) && env("CLOUDINARY_KEY", null)
      ? {
          config: {
            provider: "cloudinary",
            providerOptions: {
              cloud_name: env("CLOUDINARY_NAME"),
              api_key: env("CLOUDINARY_KEY"),
              api_secret: env("CLOUDINARY_SECRET"),
            },
            actionOptions: {
              upload: {},
              delete: {},
            },
          },
        }
      : {},
  meilisearch: {
    config: {
      // Your meili host
      host: env("MEILI_URL"),
      // Your master key or private key
      apiKey: env("MEILI_MASTER_KEY"),
      article: {
        entriesQuery: {
          locale: 'all',
        },
        settings: {
          filterableAttributes: [
            'locale',
            'tags',
            'publishedAt',
            'date',
            'createdAt'
          ],
          sortableAttributes: [
            'date',
            'publishedAt',
            'createdAt',
            'name',
          ],
        },
      },
      portofolio: {
        entriesQuery: {
          locale: 'all',
        },
        settings: {
          filterableAttributes: [
            'locale',
            'title',
            'publishedAt',
            'year',
            'createdAt'
          ],
          sortableAttributes: [
            'year',
            'publishedAt',
            'createdAt',
            'title',
          ],
        },
      },
    },
  },
});
