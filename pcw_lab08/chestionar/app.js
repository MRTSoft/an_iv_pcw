var app = angular.module('main', []);

app.controller('ctrl', function($scope, $http) {
    $scope.qTitle= "Ce se intampla doctore?";
    $scope.qCurrentId= "2";
    $scope.qTotal= "7";
    $scope.cTextVisible= "visible";
    $scope.db = [1, 2, 3];
    $http.get("intrebari.json", {
        responseType : "json"
    })
    .then(function (response) {
    	$scope.db = response.data.intrebari;
    	console.debug($scope.db);    	
    })
});