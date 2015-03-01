var ObjectID = require('mongodb').ObjectID;


CollectionDriver = function(db) {
  this.db = db;
};
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) { //B
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

CollectionDriver.prototype.getUser = function(collectionName, user, p, callback){
  this.getCollection(collectionName, function(error, the_collection){
    if(error) callback(error);
    else{
      the_collection.findOne({'username':user,'password': p}, function(err, doc){
        if(err){
          console.log("collectiondriver err")
          callback({err: err});
        }else if(doc){
          console.log("collectiondriver not giving err")
          callback(null, doc);
        } else{
          console.log("no such url");
          callback({err: "No such url"});
        }
      });
    }
  })
}

CollectionDriver.prototype.get = function(collectionName, id, callback) { //A
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$"); //B
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else the_collection.findOne({'_id':ObjectID(id)}, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

//save new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
      if( error ) callback(error)
      else {
        
        the_collection.findOne({'username': obj.username}, function(err, user){
          if(err) callback(err)
          else if(user === null){
               obj.created_at = new Date(); //B
              the_collection.insert(obj, function() { //C
                  callback(null, obj);
            });
              console.log("new user created");
          }else{
          console.log("this user already exists. user id is " + user._id);
            callback(409, "POST INVALID: THIS USER ALREADY EXISTS");
          //res.redirect(user);
          }
        });
        
      }
    });
};



//update a specific object
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            obj._id = ObjectID(entityId); //A convert to a real obj id
            obj.updated_at = new Date(); //B
            the_collection.save(obj, function(error,doc) { //C
                if (error) callback(error);
                else callback(null, obj);
            });
        }
    });
};

//delete a specific object
CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { //A
        if (error) callback(error);
        else {
            the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { //B
                if (error) callback(error);
                else callback(null, doc);
            });
        }
    });
};

exports.CollectionDriver = CollectionDriver;
