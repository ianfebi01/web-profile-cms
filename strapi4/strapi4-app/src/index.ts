export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */

  bootstrap({ strapi }: { strapi: any }): void {
    console.log("🚀 Strapi is bootstrapping...");

    const locales = [
      { name: "Sempurna Baja Steal (id)", code: "id-SB" },
      { name: "Gusdur (id)", code: "id-GD" },
    ];

    const createLocale = (locale: { name: string; code: string }) => {
      return strapi.entityService
        .findMany("plugin::i18n.locale", { filters: { code: locale.code } })
        .then((existingLocales: any[]) => {
          if (existingLocales.length === 0) {
            return strapi.entityService.create("plugin::i18n.locale", {
              data: locale,
            });
          }
        })
        .then(() =>
          console.log(`✅ Locale added: ${locale.name} (${locale.code})`)
        )
        .catch((error: any) =>
          console.error(`❌ Error adding locale: ${locale.code}`, error)
        );
    };

    // Manually chain promises to avoid Promise.resolve()
    let sequence = createLocale(locales[0]);

    for (let i = 1; i < locales.length; i++) {
      sequence = sequence.then(() => createLocale(locales[i]));
    }
  },
};
