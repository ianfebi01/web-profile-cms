import { Strapi } from "@strapi/strapi";

export default (plugin: any) => {
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx: any) => {
    await originalRegister(ctx);

    try {
      const user = ctx.body?.user;
      const userId = user?.id;

      if (userId) {
        // Check if the user already has a money manager categories
        const existingMmCategories = await strapi.entityService.findMany(
          "api::mm-category.mm-category",
          {
            filters: {
              user: {
                id: userId,
              },
            },
          }
        );

        const defaultCategories = [
          {
            name: "food",
            user: userId,
          },
          {
            name: "work",
            user: userId,
          },
          {
            name: "social-life",
            user: userId,
          },
          {
            name: "apparel",
            user: userId,
          },
          {
            name: "culture",
            user: userId,
          },
          {
            name: "beauty",
            user: userId,
          },
          {
            name: "health",
            user: userId,
          },
          {
            name: "education",
            user: userId,
          },
          {
            name: "gift",
            user: userId,
          },
          {
            name: "bill-subscription",
            user: userId,
          },
          {
            name: "house-hold",
            user: userId,
          },
          {
            name: "transportation",
            user: userId,
          },
          {
            name: "other",
            user: userId,
          },
        ];

        // If the user doesn't have a money manager categories, create one
        if (!existingMmCategories.length) {
          for (const category of defaultCategories) {
            await strapi.entityService.create("api::mm-category.mm-category", {
              data: category,
            });
          }
        }
      }
    } catch (err) {
      strapi.log.error(
        "Failed to create money manager categories after registration:",
        err
      );
    }

    return ctx.body;
  };

  return plugin;
};
