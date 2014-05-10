var app = angular.module("appAngularExample", [
	'ngResource',
	'ui.router',
	'ui.validate',
	'ui.bootstrap'
]);
app.value("baseUrl", "http://localhost:3000");

app.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
	$urlRouterProvider.otherwise( '/' );
});
app.config(function config( $stateProvider ) {
	$stateProvider.state( 'list', {
		url: '/',
		views: {
			"main": {
				controller: 'UserControllerList',
				templateUrl: '../views/list.tpl.html'
			}
		}
	});
	$stateProvider.state( 'create', {
		url: '/create',
		views: {
			"main": {
				controller: 'UserControllerEditOrCreate',
				templateUrl: '../views/edit.tpl.html'
			}
		}
	});
	$stateProvider.state( 'edit', {
		url: '/edit/:username',
		views: {
			"main": {
				controller: 'UserControllerEditOrCreate',
				templateUrl: '../views/edit.tpl.html'
			}
		}
	});
})
app.factory('UserFactory', function(baseUrl, $resource){
		return $resource(baseUrl +'/users/:_id:username',{}, {
										'query':{method:'get', isArray:true},
										'getByUsername':{method:'get', isArray:false, username: '@username'},
										'update': {method:'PUT',  _id: '@_id'}
									  })
	});

app.controller("AppController", ['$scope',function($scope){

}]);

app.controller("UserControllerList", ['$scope', '$state', 'UserFactory', '$modal', function($scope, $state, UserFactory, $modal){
	//obtenemos los usuarios
	$scope.users = UserFactory.query();

	//funcion para componer el nombre completo de un usuario
	$scope.getCompleteName = function(user){
		if(user) {
			return user.name + " " + (user.surname !== undefined ? user.username : "" );
		}
		return "";
	};

	$scope.selectedUser = function(user){
		$scope.userSelected = user;
	};

	$scope.editUser = function(user){
		$state.go("edit", {username:user.username})
	};

	$scope.deleteUser = function(user){

		var modalInstance = $modal.open({
			templateUrl: 'confirm.html',
			controller: ConfirmDeleteController,
			resolve: {
				user: function () {
					return user;
				}
			}
		});

		modalInstance.result.then(function (deleteUser) {
			if(deleteUser){
				new UserFactory().$delete({_id:user._id}).then(function(){
					$scope.users = UserFactory.query();
				}).catch(function(error){
					alert(error.data);
				});
			}
		}, function () {
			//dimiss function
		});

	}
	$scope.detailUser = function(item){
		var modalInstance = $modal.open({
			templateUrl: 'detail.html',
			controller: UserControllerDetail,
			resolve: {
				userSelected: function () {
					return item;
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			//close function
		}, function () {
			//dimiss function
		});
	}
}]);

var ConfirmDeleteController = function($scope, $modalInstance, user){
	$scope.user = user;

	$scope.accept = function(){
		$modalInstance.close(true);
	}
	$scope.close = function(){
		$modalInstance.close(false);
	}
}
var UserControllerDetail =  function($scope, $modalInstance, userSelected){
	$scope.userSelected = userSelected;
	$scope.getCompleteName = function(user){
		if(user) {
			return user.name + " " + (user.surname !== undefined ? user.username : "" );
		}
		return "";
	};
	$scope.close = function(){
		$modalInstance.close();
	}
};
app.controller("UserControllerEditOrCreate", ['$scope', '$state', '$stateParams', 'UserFactory', function($scope, $state, $stateParams, UserFactory){
	if($stateParams.username){
		$scope.user = UserFactory.getByUsername({username:$stateParams.username});
	}else{
		//$scope.user = new UserFactory();
	}

	$scope.saveUser = function(){
		if($scope.user._id){
			$scope.user.$update({_id:$scope.user._id}).then(function(){
				$state.go("list");
			}).catch(function(error){
				alert(error.data);
			});
		}else {
			UserFactory.save({}, $scope.user).$promise.then(function(){
				$state.go("list");
			}).catch(function(error){
				alert(error.data);
			});
		}
	}
}]);

app.directive("gravatar", function(){
	var linker = function($scope, element, attr, ngModel){

	}
	return {
		restrict: 'A',
		template:"<img src='https://s.gravatar.com/avatar/{{gravatar}}?s={{size}}'/>",
		link:linker,
		scope: {
			gravatar:"=",
			size:"="
		}
	}
});