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
        // Also see the NGINX config for the CSP header
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'img-src': ["'self'",
              'data:',
              'blob:',
              'dl.airtable.com',
              'https:',
              `${AWS_S3_URL}`,
            ],
            'media-src': ["'self'",
              `${AWS_S3_URL}`,
            ],
            'connect-src': ["'self'"],
            'script-src': ["'self'"],
          },
        }
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
