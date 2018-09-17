var keystone = require("keystone"),
getItemById = require("../../lib/getItemById"),
oauth = require("../../lib/auth"),
User = keystone.list("User");
//PATH: /api/getUserById
//Parameter: token (token of user)
//Example: /api.getUserById?id=1jfn29876
exports = module.exports = function (req, res) {
    var popField = "groups notifications";
    getItemById(User, req.user._id, popField, res);
}