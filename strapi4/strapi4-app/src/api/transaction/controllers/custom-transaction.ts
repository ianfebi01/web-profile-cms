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
  async monthlyChart(ctx) {
    const user = ctx.state.user;
    const { year } = ctx.query;

    if (!year) {
      return ctx.badRequest("Year is required");
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const allMonths = Array.from({ length: 12 }, (_, i) => i); // 0 to 11

    const results = await Promise.all(
      allMonths.map(async (monthIndex) => {
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 1);

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
          }
        );

        const income = transactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          monthIndex,
          income,
          expense,
          hasData: income !== 0 || expense !== 0,
        };
      })
    );

    const filtered = results.filter((r) => r.hasData);

    return {
      series: [
        {
          name: "Expense",
          data: filtered.map((r) => r.expense),
        },
        {
          name: "Income",
          data: filtered.map((r) => r.income),
        },
      ],
      categories: filtered.map((r) => monthNames[r.monthIndex]),
    };
  },
  async topExpenseCategories(ctx) {
    type CategoryTotal = {
      id: number;
      name: string;
      total: number;
    };
    const user = ctx.state.user;
    const { month, year } = ctx.query;

    if (!month || !year) {
      return ctx.badRequest("Month and year are required");
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const expenses = await strapi.entityService.findMany(
      "api::transaction.transaction",
      {
        filters: {
          user: { id: user.id },
          date: {
            $gte: startDate.toISOString(),
            $lt: endDate.toISOString(),
          },
          type: "expense",
        },
        populate: {
          mm_category: {
            fields: ["id", "name"],
          },
        },
        sort: ["date:desc"],
        fields: ["amount"],
      }
    );

    // Group by category and sum amounts
    const grouped = expenses.reduce((groups, transaction) => {
      const key = transaction.mm_category.id;

      if (!groups[key]) {
        groups[key] = {
          id: key,
          name: transaction.mm_category.name,
          total: 0,
        };
      }

      groups[key].total += transaction.amount;
      return groups;
    }, {});

    const result = Object.entries(grouped).map(([_id, values]) => values);

    const sorted = result.sort(
      (a: CategoryTotal, b: CategoryTotal) => b.total - a.total
    );

    return {
      series: sorted.map((r: CategoryTotal) => r.total),
      categories: sorted.map((r: CategoryTotal) => r.name),
    };
  },
};
