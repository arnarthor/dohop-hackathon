'use strict';

exports.index = function(req, res) {
  res.send({data: req.params.fromCountry});
};
