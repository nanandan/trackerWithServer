var http = require('http'),
    express = require('express'),
    path = require('path'),
    php = require('node-php'),
    url = require("url"),
    exec = require("child_process").exec;

 MongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
CollectionDriver = require('./collectionDriver').CollectionDriver;







var app = express();
app.set('port', process.env.PORT || 3000); 
app.set('views', path.join(__dirname, 'views')); //A
app.set('view engine', 'jade'); //B
app.use(express.bodyParser());

var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
});

/*
app.use('/push', php.cgi("/index"),function(err, res){
console.log("using push");
  if(err) res.json({err: String(err)});
});
*/
app.use(express.static(path.join(__dirname, 'public')));

app.get('/push', function(req, res){exec("php simplePush.php 12341234 12341234 12341234 someName sometime somelocation", function (error, stdout, stderr) {res.send(stdout);});});

 
app.get('/:collection', function(req, res) { //A
   var params = req.params; //B
   //var username = req.body.username;
   //var password = req.body.password;
   console.log("params are " + params);
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
	          if (req.accepts('html')) { //E
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F
              } else {
	          res.set('Content-Type','application/json'); //G
                  res.send(200, objs); //H
              }
         }
   	});
});
 
app.get('/:collection/:username/:p', function(req,res){
  var username = req.params.username;
  var collection = req.params.collection;

  console.log("username is " + req.params.username);
  var pass = req.params.p;
    console.log("password is " + req.params.p);
    console.log("collection is " + req.params.collection);

  if(username && pass){
    collectionDriver.getUser(collection, username,pass, function(error, obj){
      if(error) {
            //res.send(400, {error: 'bad url', url: req.url});
            res.send(400,{error: String(error)});
      }else{

        console.log("get is working correctly")
        res.send(200,obj);
      }

    });
  }else{

    res.send(400, JSON({error: 'bad url', url: req.url}));
  
  }
});

app.get('/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   console.log("entity is " + entity);
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});

   }
});


app.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    console.log("post is working");
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});


app.put('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }
});

app.delete('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.delete(collection, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C 200 b/c includes the original doc
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send(400, error);
   }
});
 
app.use(function (req,res) {
    res.render('404', {url:req.url});
});
 
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
