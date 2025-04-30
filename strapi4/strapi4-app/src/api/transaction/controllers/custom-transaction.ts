
export default {
  async monthly(ctx) {
    const user = ctx.state.user;
    const { month, year } = ctx.query;

    if (!month || !year) {
      return ctx.badRequest("Month and year are required");
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const transactions = await strapi.entityService.findMany(
      "api::transaction.transaction",
      {
        filters: {
          user: { id: user.id },
          date: {
            $gte: startDate.toISOString(),
            $lt: endDate.toISOString(),
          },
        },
        sort: ["date:desc"],
        populate: {
          mm_category: {
            fields: ["id", "name"],
          },
        },
      }
    );

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    function formatDate(date) {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      return `${day}`;
    }

    const grouped = transactions.reduce((groups, transaction) => {
      const dateKey = formatDate(transaction.date);

      if (!groups[dateKey]) {
        groups[dateKey] = {
          day: dateKey,
          income: 0,
          expense: 0,
          transactions: [],
        };
      }
      groups[dateKey].transactions.push(transaction);
      if (transaction.type === "income") {
        groups[dateKey].income += transaction.amount;
      } else if (transaction.type === "expense") {
        groups[dateKey].expense += transaction.amount;
      }
      return groups;
    }, {});

    const transactionsArray = Object.entries(grouped).map(
      ([_date, data]) => data
    );

    return {
      income,
      expense,
      transactions: transactionsArray,
    };
  },
};
