export default ( { env } ) => {
  const AWS_S3_URL = !!env('AWS_BUCKET_NAME') && !!env('AWS_REGION') ?
    `${env('AWS_BUCKET_NAME')}.s3.${env('AWS_REGION')}.amazonaws.com` :
    '';

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
            'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
}
