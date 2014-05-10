
var mongoose = require('mongoose');


var onDbReady = function(err){
	if(err){
		console.error("Error al conectar con la bbdd " + err);
		process.exit(1)
	}
	var users = [{
		name:'Juan',
		surname:'Rodriguez',
		username:'jrodriguez',
		email: 'jrodriguez@gmail.com',
		password: 'secreto',
		gravatar:'279aa12c3326f87c460aa4f31d18a065'
	}, {
		name:'María',
		surname:'García',
		username:'mgarcia',
		email: 'mgarcia@yahoo.com',
		password: 'secreto',
		gravatar:'279aa12c3326f87c460aa4f31d18a065'
	}, {
		name:'Ra',
		surname:'Requero',
		username:'rrequero',
		email: 'rrequero@rrequero.com',
		password: 'otrosecreto',
		gravatar:'c3322f61387b1a1ec8f8729255f745b1'
	}];
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
	res = [];
	users.forEach(function (item) {
		mongoose.model('User')(item).save(function (err) {
			res.push(item);
			if (res.length === users.length){
				process.exit();
			}
		});

	});


}


mongoose.connect('mongodb://127.0.0.1:27017/crudUsers', onDbReady);


