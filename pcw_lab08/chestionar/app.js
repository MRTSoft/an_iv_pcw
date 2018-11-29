var app = angular.module('main', []);

app.controller('ctrl', function($scope, $http) {
    $scope.db = [1, 2, 3];
    $http.get("intrebari.json", {
        responseType : "json"
    })
    .then(function (response) {
    	$scope.db = response.data.intrebari;
    	console.debug($scope.db);
    	for(i = 1; i<= $scope.db.length; ++i) {
			$scope.db[i-1].id = i;
		}
    	
    })
});
