import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfYear, endOfYear, getMonth } from "date-fns";

export default {
  async monthly(ctx) {
    const user = ctx.state.user;
    const { month, year, timezone } = ctx.query;

    if (!month || !year) {
      return ctx.badRequest("Month and year are required");
    }
    if (!timezone) {
      return ctx.badRequest("Timezone is required");
    }

    const startDate = fromZonedTime(new Date(`${year}-${month}-01`), timezone);
    const endDate = fromZonedTime(
      new Date(`${year}-${Number(month) + 1}-01`),
      timezone
    );

    const transactions = await strapi.entityService.findMany(
      "api::transaction.transaction",
      {
        filters: {
          user: { id: user.id },
          date: {
            $gte: startDate,
            $lt: endDate,
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

    function formatDateToUserTimeZone(dateStr, timeZone) {
      const utcDate = new Date(dateStr);
      const zonedDate = toZonedTime(utcDate, timeZone);

      const day = String(zonedDate.getDate()).padStart(2, "0");
      return day;
    }

    const grouped = transactions.reduce((groups, transaction) => {
      const dateKey = formatDateToUserTimeZone(transaction.date, timezone);

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
    const { year, timezone } = ctx.query;

    if (!year) {
      return ctx.badRequest("Year is required");
    }

    if (!timezone) {
      return ctx.badRequest("Timezone is required");
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

    // Get the UTC range of the whole year in that timezone
    const localStart = startOfYear(new Date(Number(year), 0));
    const localEnd = endOfYear(new Date(Number(year), 0));

    const startDate = fromZonedTime(localStart, timezone);
    const endDate = fromZonedTime(localEnd, timezone);

    // Fetch all transactions of the year in 1 query
    const transactions = await strapi.entityService.findMany(
      "api::transaction.transaction",
      {
        filters: {
          user: { id: user.id },
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      }
    );

    // const results = await Promise.all(
    //   allMonths.map(async (monthIndex) => {
    //   const localStart = startOfMonth(new Date(year, monthIndex, 1));
    //   const localEnd = startOfMonth(addMonths(localStart, 1));

    //   // Convert local times to UTC using provided timezone
    //   const startDate = fromZonedTime(localStart, timezone);
    //   const endDate = fromZonedTime(localEnd, timezone);

    //     const transactions = await strapi.entityService.findMany(
    //       "api::transaction.transaction",
    //       {
    //         filters: {
    //           user: { id: user.id },
    //           date: {
    //             $gte: startDate,
    //             $lt: endDate,
    //           },
    //         },
    //       }
    //     );

    //     const income = transactions
    //       .filter((t) => t.type === "income")
    //       .reduce((sum, t) => sum + t.amount, 0);

    //     const expense = transactions
    //       .filter((t) => t.type === "expense")
    //       .reduce((sum, t) => sum + t.amount, 0);

    //     return {
    //       monthIndex,
    //       income,
    //       expense,
    //       hasData: income !== 0 || expense !== 0,
    //     };
    //   })
    // );

    // Group per month based on timezone
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      income: 0,
      expense: 0,
    }));

    for (const tx of transactions) {
      const localDate = toZonedTime(tx.date, timezone);
      const monthIndex = getMonth(localDate); // 0-11

      if (tx.type === "income") {
        monthlyStats[monthIndex].income += tx.amount;
      } else if (tx.type === "expense") {
        monthlyStats[monthIndex].expense += tx.amount;
      }
    }

    const filtered = monthlyStats.filter(
      (r) => r.income !== 0 || r.expense !== 0
    );

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
    const { month, year, timezone } = ctx.query;

    if (!month || !year) {
      return ctx.badRequest("Month and year are required");
    }
    if (!timezone) {
      return ctx.badRequest("Timezone is required");
    }

    const startDate = fromZonedTime(new Date(`${year}-${month}-01`), timezone);
    const endDate = fromZonedTime(
      new Date(`${year}-${Number(month) + 1}-01`),
      timezone
    );

    const expenses = await strapi.entityService.findMany(
      "api::transaction.transaction",
      {
        filters: {
          user: { id: user.id },
          date: {
            $gte: startDate,
            $lt: endDate,
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
