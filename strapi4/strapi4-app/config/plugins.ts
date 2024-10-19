export default ( { env } ) => ({
  upload: env('AWS_REGION', null) && env('AWS_BUCKET_NAME', null) ? {
    config: {
        provider: 'aws-s3',
        providerOptions: {
          s3Options: {
            accessKeyId: env('AWS_ACCESS_KEY_ID', ''),
            secretAccessKey: env('AWS_ACCESS_SECRET', ''),
            region: env('AWS_REGION'),
            params: {
                Bucket: env('AWS_BUCKET_NAME'),
            },
          },
          baseUrl: env('CDN_URL', null) ? env('CDN_URL') : `https://${env('AWS_BUCKET_NAME')}.s3.${env('AWS_REGION')}.amazonaws.com`,
          sizeLimit: 250 * 1024 * 1024, // 250mb in bytes
        },
        breakpoints: {
          xlarge: 1920,
          large: 1000,
          medium: 750,
          small: 500,
          xsmall: 64
        },
    },
  } : {},
  meilisearch: {
    config: {
      // Your meili host
      host: env('MEILI_URL'),
      // Your master key or private key
      apiKey: env('MEILI_MASTER_KEY'),
    }
  }
});
