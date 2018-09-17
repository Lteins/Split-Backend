var keystone = require("keystone"),
getItemById = require("../../lib/getItemById"),
Bill = keystone.list("Bill");
//PATH: /api/getBillById
//Parameter: id (id of the product in data base)
//Example: /api.getBillById?id=1jfn29876
exports = module.exports = function (req, res) {
    var billId = req.params.id;
    var popField = "payer eParticipants participants";
    getItemById(Bill, billId, popField, res);
}