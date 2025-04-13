export default {
  async beforeCreate(event) {
    try {
      const { data } = event.params;

      if (!data.slug) {
        console.warn('No slug provided in creation data');
        return;
      }

      if (!data.locale) {
        console.error('Locale is missing in creation data');
        throw new Error('Locale is required when creating i18n content');
      }

      await validateUniqueSlug(data.slug, data.locale);
      console.debug(`Slug "${data.slug}" validated for locale ${data.locale}`);
    } catch (error) {
      console.error('Validation failed:', error.message);
      console.error('Full error:', error);
      throw error; // This will cause the 400 response
    }
  },

  async beforeUpdate(event) {
    try {
      const { data, where } = event.params;

      if (!data.slug) {
        console.debug('No slug update detected');
        return;
      }

      const existing = await strapi.entityService.findOne(
        'api::article.article',
        where.id,
        { fields: ['locale', 'slug'] }
      );

      if (!existing) {
        console.error('Article not found for update');
        throw new Error('Article not found');
      }

      const locale = data.locale || existing.locale;
      if (!locale) {
        console.error('Locale could not be determined');
        throw new Error('Locale is required');
      }

      // Only validate if slug is actually changing
      if (data.slug !== existing.slug) {
        await validateUniqueSlug(data.slug, locale);
        console.debug(`Slug updated from "${existing.slug}" to "${data.slug}" for locale ${locale}`);
      }
    } catch (error) {
      console.error('Update validation failed:', error.message);
      throw error;
    }
  }
};

async function validateUniqueSlug(slug: string, locale: string) {
  if (!slug || !locale) {
    console.error('Invalid validation parameters:', { slug, locale });
    throw new Error('Both slug and locale are required for validation');
  }

  console.debug(`Checking uniqueness of slug "${slug}" for locale ${locale}`);

  const existing = await strapi.db.query('api::article.article').findOne({
    where: {
      slug,
      locale,
      // Optional: only check published content
      // $not: { publishedAt: null }
    }
  });

  if (existing) {
    console.warn(`Duplicate slug found: ID ${existing.id}, created at ${existing.createdAt}`);
    throw new Error(`Slug "${slug}" already exists for ${locale} locale`);
  }
}
