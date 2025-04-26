/**
 * transaction controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::transaction.transaction', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user || !user.id) {
      return ctx.unauthorized('User not authenticated');
    }

    ctx.request.body.data.user = user.id;

    const response = await super.create(ctx);

    return response;
  }
}));
