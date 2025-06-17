export default {
  routes: [
    {
      method: 'GET',
      path: '/transactions/monthly',
      handler: 'custom-transaction.monthly',
      config: {
        policies: [],
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/transactions/monthly-chart',
      handler: 'custom-transaction.monthlyChart',
      config: {
        policies: [],
        auth: {},
      },
    },
    {
      method: 'GET',
      path: '/transactions/top-expense-categories',
      handler: 'custom-transaction.topExpenseCategories',
      config: {
        policies: [],
        auth: {},
      },
    },
  ],
};
