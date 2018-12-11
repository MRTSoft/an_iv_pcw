var app = angular.module('main', []);

app.controller('ctrl', function($scope, $http) {
	$scope.catalog = [];
	$http.get("produse.json", {
        responseType : "json"
    })
    .then(function (response) {
    	console.log(response);
    	$scope.db = response.data.produse;
    	$scope.index = 0;
    });
    $scope.imgIndex = 0;

    $scope.swapImage = function(imgSrc) {
    	console.log(imgSrc);
    	newIndex = $scope.db[$scope.index].imagini.indexOf(imgSrc);
    	if (newIndex > -1){
    		$scope.imgIndex = newIndex;
    	}
    }

    $scope.swapProduct = function(prodIndex){
    	$scope.index = prodIndex;
    }
});
