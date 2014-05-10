User = Backbone.Model.extend({
	//url: "http://localhost:3000/users",
	url : function() {
		return this.id ? 'http://localhost:3000/users/' + this.id : 'http://localhost:3000/users';
	},
	idAttribute: "_id",
	defaults: {
		username: '',
		password: '',
		name: '',
		surname: '',
		gravatar: '',
		email: ''
	}
});

Users = Backbone.Collection.extend({
	url: "http://localhost:3000/users",
	model: User
});

window.UserListItemView = Backbone.View.extend({

	tagName:"tr",
	events:{
		'click .deleteButton': 'deleteUser'
	},
	initialize:function () {
		this.model.bind("change", this.render, this);
		this.model.bind("destroy", this.close, this);
	},

	render:function (eventName) {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},
	deleteUser : function(event){

		this.model.destroy();
	}
});

window.UserListView = Backbone.View.extend({
	tagName: 'div',
	className: '',

	initialize: function(){
		this.model.on("sync",this.render, this);
		this.model.on("destroy",this.render, this);
		this.model.on("reset",this.render, this);

	},
	render: function(eventName){

		$(this.el).html(this.template({list:this.model.toJSON()}));
		//this.delegateEvents();
		return this;
	},


	render:function (eventName) {
		$(this.el).html(this.template());
		_.each(this.model.models, function (user) {
			$(this.el).find("tbody").append(new UserListItemView({model:user}).render().el);
		}, this);
		return this;
	}
});


var AppRouter = Backbone.Router.extend({
	routes: {
		""                  	: "list",
		"list"					: "list",
		"edit"					: "edit",
		"edit/:username"		: "edit"
	},

	list : function(){
		this.userList = new Users();

		//pasamos el modelo que es la lista de usuarios
		var listView = new UserListView({model: this.userList});
		this.userList.fetch();

		$("#principal").html(listView.el);
	},
	edit : function(){

	}

});

utils.loadTemplate(['UserListView', 'UserListItemView'], function() {
	window.app = new AppRouter();
	Backbone.history.start();

});
