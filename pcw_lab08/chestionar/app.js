var app = angular.module('main', []);

app.controller('ctrl', function($scope, $http) {
    $scope.uAns = {};
    $scope.showScore = 'none';
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
        $scope.score = 0.0;
        console.log($scope.db);
		for(qi in $scope.db){
            q = $scope.db[qi];
            console.log(q);
            if (q.uAns != undefined){
                if (q.tip == "numeric"){
                    if (q.uAns == q.corecte[0]){
                        $scope.score += 1.0;
                    }
                }
                if (q.tip == "text"){
                    a = q.uAns.replace(/\s/g, '').toLowerCase();
                    b = q.corecte[0].replace(/\s/g, '').toLowerCase();
                    if (a == b){
                        $scope.score += 1.0;
                    }
                }
                if (q.tip == "simplu"){
                    if (q.uAns == q.corecte[0])
                        $scope.score += 1.0;
                }
                if (q.tip == "multiplu"){
                    for (i = 0; i<q.raspunsuri.length; ++i){
                        if (q.uAns[i] == undefined){
                            q.uAns[i] = false;
                        }
                    }
                    correct = true;
                    for (a = 0; a < q.uAns.length && correct == true; a = a+1){
                        if (q.uAns[a]){
                            if (q.corecte.indexOf(q.raspunsuri[a]) == -1){
                                correct = false;
                            }
                        } else {
                            if (q.corecte.indexOf(q.raspunsuri[a]) != -1){
                                correct = false;
                            }
                        }
                    }
                    if (correct){
                        $scope.score += 1.0;
                    }
                }//if multiplu
            }//if uAns != undefined
            console.log(qi);
            console.log($scope.score);
        }//for each question

        $scope.score = $scope.score / $scope.db.length * 100.0;
        $scope.showScore = 'inherit';
	}
});
