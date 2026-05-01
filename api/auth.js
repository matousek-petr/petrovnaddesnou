const { getHandlers } = require('./_cms-oauth');

module.exports = async (req, res) => {
  const { begin } = getHandlers();
  return begin(req, res);
};
