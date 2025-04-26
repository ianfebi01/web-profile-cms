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
  ],
};
