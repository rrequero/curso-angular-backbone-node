User = Backbone.Model.extend({
	//url: "http://localhost:3000/users",
	url : function() {
		return this.id ? 'http://localhost:3000/users/' + this.id : 'http://localhost:3000/users';
	},
	idAttribute: "_id",
	defaults: {
		username: '',
		password: '',
		repeatpassword:'',
		name: '',
		surname: '',
		gravatar: '',
		email: ''
	},
	validation: {
		email: {
			required: true,
			pattern: 'email',
			msg: 'Invalid email'
		},
		password: {
			required: true,
			minLength: 5,
			msg:'The field must contain at least 5 characters'
		},
		name: {
			required: true,
			msg:'Required field'
		},
		username: {
			required: true,
			msg:'Required field'
		},
		repeatpassword: {
			equalTo: 'password',
			msg:'Repeat password should be equal to password'
		}
	}
});

Users = Backbone.Collection.extend({
	url: "http://localhost:3000/users",
	model: User
});

window.UserDetailModal = Backbone.Modal.extend({
	//template: _.template($('#modal-template').html()),
	cancelEl: '#closeDetail'

});

window.UserListItemView = Backbone.View.extend({

	tagName:"tr",
	events:{
		'click .deleteButton': 'deleteUser',
		'click [data-toggle="modal"]': 'openModal'
	},
	modal:null,
	initialize:function (options) {
		this.model.bind("change", this.render, this);
		this.model.bind("destroy", this.close, this);

	},

	render:function (eventName) {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	},
	deleteUser : function(event){
		this.model.destroy();
	},
	openModal: function(){
		var modalView = new UserDetailModal({model:this.model});
		//modalView.template = modalView.template(this.model.toJSON());
		$('#modal').html(modalView.render().el);
	}
});

window.UserListView = Backbone.View.extend({
	tagName: 'div',
	className: '',
	modal:null,
	initialize: function(){
		this.model.on("sync",this.render, this);
		this.model.on("destroy",this.render, this);
		this.model.on("reset",this.render, this);

	},
	/*render: function(eventName){

		$(this.el).html(this.template({list:this.model.toJSON()}));
		//this.delegateEvents();
		return this;
	},*/


	render:function (eventName) {
		$(this.el).html(this.template());

		_self = this;
		_.each(this.model.models, function (user) {
			$(this.el).find("tbody").append(new UserListItemView({model:user}).render().el);
		}, this);
		return this;
	}
});

window.UserEditView = Backbone.View.extend({
	tagName: 'div',
	className: '',

	initialize: function(){
		if(this.model) {
			this.model.on("sync", this.render, this);
			this.model.on("change", this.render, this);
		}

		Backbone.Validation.bind(this);
	},
	events:{
		"change input" : "change",
		"click .save": "saveUser",
		"click .cancel": "cancel"
	},
	render: function(eventName){

		$(this.el).html(this.template(this.model.toJSON()));
		if(!this.model.isNew()){
			$(this.el).find("#username").attr("disabled", "disabled");
			$(this.el).find("#editTitle").show();
			$(this.el).find("#createTitle").hide();
		}else{
			$(this.el).find("#editTitle").hide();
			$(this.el).find("#createTitle").show();
		}
		//this.delegateEvents();
		return this;
	},

	change: function(event){
		var target = event.target;
		var change = new Array();
		change[target.name] = target.value;
		this.model.set(change);
	},

	saveUser: function(){
		this.model.set({
			username: $("#username").val(),
			password:$("#password").val() ,
			name: $("#name").val(),
			surname: $("#surname").val(),
			gravatar: $("#gravatar").val(),
			email: $("#email").val()
		});
		if (this.model.isNew()) {
			app.userList.create(this.model,  {
				success:function () {
					app.navigate('/', true);
				},
				error: function (model, error) {
					alert(error);
				}
			});
		} else {
			this.model.save();
			app.navigate('/', true);
		}
		return false;
	}

});


var AppRouter = Backbone.Router.extend({
	routes: {
		""                  	: "list",
		"list"					: "list",
		"create"				: "edit",
		"edit/:username"		: "edit"
	},

	list : function(){
		this.userList = new Users();

		//pasamos el modelo que es la lista de usuarios
		var listView = new UserListView({model: this.userList});
		this.userList.fetch();

		$("#principal").html(listView.el);
	},
	edit : function(username){
		if(!this.userList){
			this.userList = new Users();
			this.userList.fetch();
		}
		if(username){
			this.user = this.userList.where({username:username});
		}

		var view = new UserEditView(this.user && this.user.length>0 && username ? {model: this.user[0]}: {model: new User()});

		$("#principal").html(view.render().el);
	}

});


_.extend(Backbone.Validation.callbacks, {
	valid: function (view, attr, selector) {
		var $el = view.$('[name=' + attr + ']'),
			$group = $el.closest('.form-group');

		$group.removeClass('has-error');
		$group.find('.help-block').html('').addClass('hidden');
	},
	invalid: function (view, attr, error, selector) {
		var $el = view.$('[name=' + attr + ']'),
			$group = $el.closest('.form-group');

		$group.addClass('has-error');
		$group.find('.help-block').html(error).removeClass('hidden');
	}
});

utils.loadTemplate(['UserListView', 'UserListItemView', 'UserEditView', 'UserDetailModal'], function() {
	window.app = new AppRouter();
	Backbone.history.start();

});
