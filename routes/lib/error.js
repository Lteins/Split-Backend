function inherit(A, B){
  var origin = A.prototype;
  A.prototype = Object.create(B.prototype);
  for (var x in origin) {
    A.prototype[x] = origin[x];
  }
  A.prototype.constructor = A;
}

var MyError = function MyError(origin, level){
    this.customized = true;
    this.origins = [origin];
    this.level = level;
    this.addOrigin = function(upperOrigin){
        this.origins.push(upperOrigin);
    }
    this.chain = function(err){
        this.causedBy = err;
    }
    this.addRes = function(res){
        this.res = res;
    }
}


exports.MyError = MyError;

var ItemNotFound = function ItemNotFound(id, model, origin, level){
    MyError.call(this, origin, level);
    this.id = id;
    this.model = model;
    
    this.message = function(){return this.model + " of id(" + this.id + ") Not Found"}
}
inherit(ItemNotFound, MyError);
exports.ItemNotFound = ItemNotFound;

var DataBaseError = function DataBaseError(model, origin, err) {
    MyError.call(this, origin, 'error');
    this.model = model;
    this.chain(err);
}
inherit(DataBaseError, MyError);
exports.DataBaseError = DataBaseError;

var UpdateError = function UpdateError(id, itemInfo, model, origin, err){
    DataBaseError.call(this, model, origin, err);
    this.id = id;
    this.itemInfo = itemInfo;
    this._detail = function(){
        var detail = "\nITEM DETAIL: \n"; 
        for (var x in this.itemInfo){
            detail = detail + x + ": " + JSON.stringify(this.itemInfo[x]) + "\n";
        }
        return detail;
    };
    this.message = function(){return "Error Updating " + model + " of id(" + this.id + ")" + this._detail()};
}
inherit(UpdateError, DataBaseError);
exports.UpdateError = UpdateError;

var SaveError = function SaveError(itemInfo, model, origin, err){
    DataBaseError.call(this, model, origin, err);
    this.itemInfo = itemInfo;
    this._detail = function(){
        var detail = "\nITEM DETAIL: \n";
        for (var x in this.itemInfo){
            detail = detail + x + ": " + JSON.stringify(this.itemInfo[x]) + "\n";
        }
        return detail;
    };
    this.message = function(){return "Cannot Save Item of Type " + this.model + this._detail()};
}
inherit(SaveError, DataBaseError);
exports.SaveError = SaveError;

var FindError = function FindError(id, model, origin, err) {
    DataBaseError.call(this, model, origin, err);
    this.id = id;
    this.message = function(){return "Error seeking for " + this.model + " of id(" + this.id + ")"};
}
exports.FindError = FindError;


var InvalidParameter = function InvalidParameter(paramName, paramValue, origin) {
    MyError.call(this, origin, 'warn');
    this.paramName = paramName;
    this.paramValue = paramValue;
    this.message = function(){
        return "Invalid Value(" + this.paramValue + ") of Parameter(" + this.paramName+ ")"; 
    }
}
inherit(InvalidParameter, MyError);
exports.InvalidParameter = InvalidParameter;


var InfoMiss = function InfoMiss(info, origin) {
    MyError.call(this, origin, 'warn');
    this.missedArea = [];
    for (var x in info) {
        if (!info[x])
            this.missedArea.push(x);
    }
    this.message = function() {
        var areas = "Areas: ";
        for (var i=0;i<this.missedArea.length;i++)
            areas = areas + this.missedArea[i] + " "
        return areas + "are missed";
    }
}
inherit(InfoMiss, MyError);
exports.InfoMiss = InfoMiss;


var UserDuplication = function UserDuplication(user, origin){
    MyError.call(this, origin, 'warn');
    this.user = user;
    this.message = function() {
        return "Duplication with User(" + user.email + ")";
    }
}
inherit(UserDuplication, MyError);
exports.UserDuplication = UserDuplication;


var ParallelInterruption = function ParallelInterruption(origin, err) {
    MyError.call(this, origin, 'error');
    this.chain(err);
    this.message = function(){
        return "Parallel Partial Fail";
    }
}
inherit(ParallelInterruption, MyError);
exports.ParallelInterruption = ParallelInterruption;

var ParallelPartialFail = function ParallelPartialFail(errList, origin) {
    var level = 'warn'
    for (var i=0;i<errList.length;i++){
        if (errList[i].level == 'error'){
            level = 'error';
            break;
        }
    }
    MyError.call(this, origin, level);
    this.errList = errList;
    this.failId = [];
    for (var i=0;i<this.errList.length;i++){
        this.failId.push(errList[i].id);
    }
    this.message = function() {
        var report = "Parallel Partial Fail" + "\n";
        report = report + "\n---Error List---\n";
        for (var i=0;i<this.errList.length;i++){
            report = report + this.errList[i].constructor.name 
            + ": " + this.errList[i].message() + "\n";
        }
        report = report + "\n---Error List---\n";
        return report;
    }
}
inherit(ParallelPartialFail, MyError);
exports.ParallelPartialFail = ParallelPartialFail;

var FileSystemError = function FileSystemError(source, target, err, origin) {
    var level = 'error';
    MyError.call(this, origin, level);
    this.source = source;
    this.target = target;
    this.chain(err);
    this.message = function() {
        var report = "Fail to move file from " + source + " to " + target;
        return report;
    }
}
