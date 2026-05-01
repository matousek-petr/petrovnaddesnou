const { getHandlers } = require('./_cms-oauth');

module.exports = async (req, res) => {
  const { complete } = getHandlers();
  return complete(req, res);
};
