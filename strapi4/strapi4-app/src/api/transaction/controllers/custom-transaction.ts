export default {
  async monthly(ctx) {
    const user = ctx.state.user;
    const { month } = ctx.query;

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const transactions = await strapi.entityService.findMany('api::transaction.transaction', {
      filters: {
        user: { id: user.id },
        date: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      },
      sort: ['date:desc'],
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      transactions,
    };
  }
};
