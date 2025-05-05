export default {
  async beforeCreate(event) {
    const { params } = event;

    if (params?.data && params?.context?.state?.user) {
      params.data.user = params.context.state.user.id;
    }
  },
};
