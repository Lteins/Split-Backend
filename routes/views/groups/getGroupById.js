var keystone = require("keystone"),
getItemById = require("../../lib/getItemById"),
Group = keystone.list("Group");
//PATH: /api/getGroupById
//Parameter: id (id of the product in data base)
//          token: userToken
exports = module.exports = function (req, res) {
    var groupId = req.body.id;
    var popField = "bills members";
    getItemById(Group, groupId, popField, res);
}