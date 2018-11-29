var app = angular.module('main', []);

app.controller('ctrl', function($scope, $http) {
    $scope.uAns = {};
    $http.get("intrebari.json", {
        responseType : "json"
    })
    .then(function (response) {
    	$scope.db = response.data.intrebari;
    	console.debug($scope.db);
    	for(i = 0; i< $scope.db.length; ++i) {
			$scope.db[i].id = i;
			if ($scope.db[i].tip == 'multiplu'){
				$scope.db[i].uAns = [];
			}
			else {
				$scope.db[i].uAns = undefined;
			}
		}
    	
    })
    
    $scope.calculateScore = function () {
		console.log($scope.db);
	}
});
