var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * Friends
 * 
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: String, required: true, initial: true},
	email: { type: Types.Email, initial: true, required: true},
    ifImg: {type: Boolean, required: true, default: false},
	password: { type: Types.Password, initial: true, required: true, initial: true },
    groups: { type: Types.Relationship, ref: "Group", many: true, required: false},
    payment: {type: String},
    notifications: { type: Types.Relationship, ref: "Notification", many: true, required: false}
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true, default: false},
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.defaultColumns = 'name, email, isAdmin';
User.register();
