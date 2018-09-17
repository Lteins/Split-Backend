/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash');

var keystone = require("keystone"),
    User = keystone.list("User"),
    oauth = require("./lib/auth"),
    errorHandler = require("./lib/errorHandler");

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
	];
	res.locals.user = req.user;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
	Error Type:
		Invalid UserId (Error)
		Error when searching for User (Error)
		Invalid Token (Warn)
 */
exports.requireUser = function (req, res, next) {
	var userId = oauth.authentication(req.body.token);
    logger.debug('UserId: ' + userId);
    if (userId) {
        User.model.findOne({"_id": userId})
        .exec()
        .then(function(user){
            logger.debug("User: " + JSON.stringify(user));
            if (user){
                req.user = user;
                next();
            } else{
                throw {'message': 'invalid userId',
                        'origin': 'requireUser middleware',
                        'level': 'error'};
                logger.error("Invalid userId");
            }
        }, function(err){
            throw { 'message': 'Error searching for user',
                    'origin': 'requireUser middleware',
                    'level': 'error',
                    'detail': err};

        })
        .catch(function (err) {
            logger[err.level](err.message);
            res.apiError(err.message, err);
        });
    } else{
        var err = {'message': 'Invalid Token',
                    'origin': 'requireUser middleware',
                    'level': 'warn'};
        logger[err.level](err.message);
        res.apiError(err.message, err);
    }
};

