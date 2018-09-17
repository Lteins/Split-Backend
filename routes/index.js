var keystone = require('keystone');
var middleware = require('./middleware');
var cors = require('cors');

var cor = cors();
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
exports = module.exports = function (app) {

    app.all('/api/createUser', [cor, keystone.middleware.api], routes.views.users.createUser);
    app.all('/api/signIn', [cor, keystone.middleware.api], routes.views.users.signIn);
    app.all('/api/getUserById', [cor, keystone.middleware.api, middleware.requireUser], routes.views.users.getUserById);
    app.all('/api/searchUserByEmail', [cor, keystone.middleware.api], routes.views.users.searchUserByEmail);
    app.all('/api/updateUserImg', [cor, keystone.middleware.api, middleware.requireUser], routes.views.users.updateUserImg);
    app.all('/api.updateUser', [cor, keystone.middleware.api, middleware.requireUser], routes.views.users.updateUser);

    app.all('/api/createGroup', [cor, keystone.middleware.api, middleware.requireUser], routes.views.groups.createGroup);
    app.all('/api/getGroupById', [cor, keystone.middleware.api, middleware.requireUser], routes.views.groups.getGroupById);
    app.all('/api/updateGroupImg', [cor, keystone.middleware.api, middleware.requireUser], routes.views.groups.updateGroupImg);
    app.all('/api/updateGroupInfo', [cor, keystone.middleware.api, middleware.requireUser], routes.views.groups.updateGroupInfo);
    app.all('/api/addMember', [cor, keystone.middleware.api, middleware.requireUser], routes.views.groups.addMember);

    app.all('/api/createBill', [cor, keystone.middleware.api, middleware.requireUser], routes.views.bills.createBill);

    app.all('/api/reply', [cor, keystone.middleware.api, middleware.requireUser], routes.views.notifications.reply);
    app.all('/api/getSuspended', [cor, keystone.middleware.api, middleware.requireUser],routes.views.notifications.getSuspended); 
    // app.get('/api/getRecordById', keystone.middleware.api, routes.api.records.getRecordById);
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
