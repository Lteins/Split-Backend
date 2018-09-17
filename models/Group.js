var keystone = require('keystone');
var Types = keystone.Field.Types;

var myStorage = new keystone.Storage({
  adapter: keystone.Storage.Adapters.FS,
  fs: {
    path: keystone.expandPath('./public/uploads'), // required; path where the files should be stored
    publicPath: '/public/uploads', // path where files will be served
  }
});

/**
 * Group:
 * Title: select between several pre-defined values
 * Photo: Optional (Yet to be handled)
 * Bills: one-2-many relationship with Bill
 * Destination: geoLocation? description? optional? 
 * StartDate: Date type
 * EndDate: Date type
 * Participants: many-2-many relationship with User
 * ==========
 */

 var group = keystone.List('Group');
 group.add({
    title: {type:String, required: true, default: "Undefined"},
    bills: {type:Types.Relationship, ref: "Bill", many: true, required: false},
    ifImg: {type: Boolean, default: false},
    startDate: {type:Date, default: new Date(), required: true},
    endDate: {type:Date, default: new Date( (new Date()).setDate( (new Date()).getDate() +7 )  ) ,required: true},
    eMembers: {type: Types.Relationship, ref: "User", many: true, required: true, initial: true},
    members: {type: Types.Relationship, ref:"User", many: true, required: false},
 });

group.register();

 