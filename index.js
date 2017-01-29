var log = require('logger')('vehicle-fuels-service');
var utils = require('utils');
var VehicleFuels = require('vehicle-fuels');
var sanitizer = require('./sanitizer');

var express = require('express');
var router = express.Router();

module.exports = router;

var paging = {
    start: 0,
    count: 1000,
    sort: ''
};

var fields = {
    '*': true
};

router.get('/vehicle-fuels/:id', function (req, res) {
    VehicleFuels.findOne({_id: req.params.id}).exec(function (err, fuel) {
        if (err) {
            log.error(err);
            res.status(500).send([{
                code: 500,
                message: 'Internal Server Error'
            }]);
            return;
        }
        if (!fuel) {
            res.status(404).send([{
                code: 404,
                message: 'Vehicle Fuel Not Found'
            }]);
            return;
        }
        res.send(sanitizer.clean(fuel));
    });
});

router.get('/vehicle-fuels', function (req, res) {
    var data = req.query.data ? JSON.parse(req.query.data) : {};
    sanitizer.clean(data.query || (data.query = {}));
    utils.merge(data.paging || (data.paging = {}), paging);
    utils.merge(data.fields || (data.fields = {}), fields);
    VehicleFuels.find(data.query)
        .skip(data.paging.start)
        .limit(data.paging.count)
        .sort(data.paging.sort)
        .exec(function (err, fuels) {
            if (err) {
                log.error(err);
                res.status(500).send([{
                    code: 500,
                    message: 'Internal Server Error'
                }]);
                return;
            }
            res.send(fuels);
        });
});

