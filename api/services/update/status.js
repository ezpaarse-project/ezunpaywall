let isUpdate = false;

const startUpdate = () => {
  inUpdate = true;
};

const endUpdate = () => {
  inUpdate = false;
};

const getStatus = () => inUpdate;

module.exports = {
  startUpdate,
  endUpdate,
  getStatus,
};
