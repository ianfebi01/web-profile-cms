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
    },
  },
});
