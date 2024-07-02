/* eslint-disable no-param-reassign */

const countDOIPlugin = {
  requestDidStart() {
    return {
      executionDidStart() {
        return {
          willResolveField({ args, contextValue }) {
            const countDOI = args?.dois?.length;

            if (!countDOI) { return; }

            contextValue.res.req.countDOI = countDOI;
            contextValue.countDOI = countDOI;
          },
        };
      },
    };
  },
};

module.exports = countDOIPlugin;
