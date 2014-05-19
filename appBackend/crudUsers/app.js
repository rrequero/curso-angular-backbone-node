var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var allowCrossDomain = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")

	next();
}
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());


var onDbReady = function(err){
	if(err){
		console.error("Error al conectar con la bbdd " + err);
		process.exit(1)
	}
	/**
	Definimos el modelo
	**/
	var Schema = mongoose.Schema;

	var User = new Schema({
		username:	{ type: String, required: true, index : { unique : true}, trim: true },
		email:		{ type: String, required: true, trim: true },
		password:	{ type: String, required: true },
		name:		{ type: String, required: true, trim: true },
		surname:	{ type: String, required: false, trim: true },
		createdAt:	{ type: Date, default: Date.now },
		gravatar: 	{type: String, required:false}
	});
	mongoose.model('User', User);
	
	/**
	Definimos las rutas de nuestro CRUD
	**/
	var router = express.Router();

	router.get('/users', function(req, res) {
		mongoose.model('User').find({},
				function (err, list) {
					if(err){
						 console.log("Error "+err);
					}else{
						res.json(list);
					}
				}
			);
	});

	router.get('/users/:username', function(req, res) {
		mongoose.model('User').findOne({username:req.params.username},
			function (err, list) {
				if(err){
					console.log("Error "+err);
				}else{
					res.json(list);
				}
			}
		);
	});

	router.post('/users', function(req, res) {
		//comprobamos si existe un usuario con el mismo username
		mongoose.model('User').findOne({username:req.body.username}, function(err, user){
			if(err){
				res.status(510);
				res.send("Error delete user");
			}else{
				if(user){
					res.status(510);
					res.send("Duplicated user");
				}else{
					//creamos el usuariovar userModel = mongoose.model('User');
					var userModel = mongoose.model('User');
					
					var user = {
						name:req.body.name,
						username: req.body.username,
						email: req.body.email,
						password: req.body.password,
						surname: req.body.surname,
						gravatar:req.body.gravatar
					};
					var userInstance = new userModel(user);
					userInstance.save(function (err, user){
						if(err){
							res.status(510);
							res.send("Error create user " + err);
						}else{
							res.json(user);
						}
					});
				}
					
			}
			
		});  
	});

	router.put('/users/:id', function(req, res) {
	  //comprobamos si existe un usuario con el mismo username
		mongoose.model('User').findOne({_id:ObjectId(req.params.id) }, function(err, user){
			if(err){
				res.status(510);
				res.send("Error delete user");
			}else{
				if(!user){
					res.status(510);
					res.send("User not exist");
				}else{
					user.name=req.body.name;
					user.email= req.body.email;
					user.password= req.body.password;
					user.surname= req.body.surname;
					user.gravatar=req.body.gravatar;
					
					//var userInstance = new userModel(user);
					user.save(function (err, user){
						if(err){
							res.status(510);
							res.send("Error update user " + err);
						}else{
							res.send("");
						}
					});
				}
					
			}
			
		});  
	});

	router.delete('/users/:id', function(req, res) {
		mongoose.model('User').remove({
			_id:ObjectId(req.params.id)
			},function(err){
				if(err){
					res.status(510);
					res.send("Error delete user");
				}else{
					res.send("");
				}
			});
	});

	app.use("/", router);

	app.set('port', process.env.PORT || 3000);
	//arrancamos el servidor
	var server = app.listen(app.get('port'), function() {
	 console.log('Express server listening on port ' + server.address().port);
	});

}

//conectamos a la bbdd
mongoose.connect('mongodb://127.0.0.1:27017/crudUsers', onDbReady);


