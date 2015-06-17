var myApp = angular.module('myApp', ['ui.router', 'ui.bootstrap', "xeditable", 'ngNotify', 'angularUtils.directives.dirPagination']);

// define route and controller for each view
myApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/index");
    $stateProvider
        .state('index', {
            url: '/index',
            views: {
                "navbar": {
                    templateUrl: "header.html",
                    controller: 'loginController'
                },
                "content": {
                    templateUrl: "home.html",
                    controller: "homeController"
                }
            }
        })
        .state('graph', {
            url: '/graph',
            views: {
                "navbar": {
                    templateUrl: "header.html",
                    controller: 'loginController'
                },
                "content": {
                    templateUrl: "graph.html",
                    controller: "homeController"
                }
            }
        })
        .state('history', {
            url: '/history',
            views: {
                "navbar": {
                    templateUrl: "header.html",
                    controller: 'loginController'
                },
                "content": {
                    templateUrl: "history.html",
                    controller: 'historyController'
                }
            }
        })
        .state('doctor_add', {
            url: '/add',
            views: {
                "navbar": {
                    templateUrl: "doctor/doctor_header.html",
                    controller: 'doctorController'
                },
                "content": {
                    templateUrl: "doctor/add.html",
                    controller: 'doctorAddController'
                }
            }
        })
        .state('doctor_view', {
            url: '/view',
            views: {
                "navbar": {
                    templateUrl: "doctor/doctor_header.html",
                    controller: 'doctorController'
                },
                "content": {
                    templateUrl: "doctor/view.html",
                    controller: 'doctorViewController'
                }
            }
        })
        .state('admin', {
            url: '/admin',
            views: {
                "navbar": {
                    templateUrl: "admin/admin_header.html",
                    controller: 'adminController'
                },
                "content": {
                    templateUrl: "admin/admin.html",
                    controller: 'adminController'
                }
            }
        });
});

// set theme for x-editable
myApp.run(function (editableOptions) {
    editableOptions.theme = 'bs3';
});

myApp.controller('loginController', function ($scope, $state, $http) {
    $scope.login = function () {
        console.log("/login");

        $http.post('database/login.php', {username: $scope.username, password: $scope.password})
            .success(function (result) {
                switch (result) {
                    case "admin":
                        console.log("Logged in as admin");
                        $state.go('admin');
                        break;
                    case "doctor":
                        console.log("Logged in as doctor");
                        $state.go('doctor_add');
                        break;
                    default:
                        console.log("Logged in failed");
                        break;
                }
            });
    };
});

myApp.controller('homeController', function ($scope, $state, $http, patientService) {
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.$on('$viewContentLoaded', function () {
        if ($scope.patients == null)
            $scope.loadPatients();

        //$scope.loadLastPatientPulse();
    });


    $scope.loadPatients = function () {
        $http.post('database/load_patient.php')
            .success(function (data) {
                console.log(data);
                $scope.patients = data;
                $scope.displayedCollection = [].concat($scope.patients);
            });
    };

    $scope.loadLastPatientPulse = function () {
        $http.post('database/load_patient_pulse.php')
            .success(function (data) {
                console.log(data);
                $scope.patients_pulse = data;
            })
    };

    $scope.setPatient = function (patient) {
        patientService.setPatient(patient);
    }

});

myApp.controller('historyController', function ($scope, $state, $http, patientService) {
    $scope.patient = patientService.getPatient();
});

myApp.service('patientService', function () {
    var patient;

    var setPatient = function (target) {
        patient = target;
    };

    var getPatient = function () {
        return patient;
    };

    return {
        setPatient: setPatient,
        getPatient: getPatient
    };
});

myApp.controller('adminController', function ($scope, $state, $http) {
    $scope.selectedItem = "admin";
    $scope.status = ["admin", "doctor"];

    $scope.$on('$viewContentLoaded', function () {
        $scope.isLogin();
        $scope.loadUsers();
    });

    $scope.isLogin = function () {
        $http.post('database/check_login.php')
            .success(function (data) {
                switch (data) {
                    case "admin":
                        break;
                    case "doctor":
                        alert("You are not login yet!");
                        $state.go('index');
                        break;
                    default:
                        alert("You are not login yet!");
                        $state.go('index');
                }
            });
    };

    $scope.loadUsers = function () {
        $http.post('database/load_users.php')
            .success(function (data) {
                $scope.users = data;
            });
    };

    $scope.removeUser = function (index) {
        $http.post('database/remove_user.php', {
            id: $scope.users[index].id
        })
            .success(function (data, status, headers, config) {
                alert(data);
            });
        $scope.users.splice(index, 1);
    };

    // logging out and redirect to login page
    $scope.logout = function () {
        $http.post('database/logout.php')
            .success(function (data) {
                if (data == "success") {
                    $state.go('index');
                } else {
                    console.log("fail");
                    $state.go('index');
                }
            });
    };

    $scope.addDoctor = function () {
        $http.post('database/add_doctor.php', {
            username: $scope.username,
            password: $scope.password,
            status: $scope.selectedItem
        })
            .success(function (result) {
                console.log(result);
                $scope.users.push(result[0]);
            })
    }
});

myApp.controller('doctorController', function ($scope, $state, $http) {

    // logging out and redirect to login page
    $scope.logout = function () {
        $http.post('database/logout.php')
            .success(function (data) {
                if (data == "success") {
                    $state.go('index');
                } else {
                    console.log("fail");
                    $state.go('index');
                }
            });
    };
});

myApp.controller('doctorAddController', function ($scope, $http, $state, ngNotify) {
    $scope.selectedItem = "Male";

    $scope.sex = ["Male", "Female"];

    $scope.$on('$viewContentLoaded', function () {
        $scope.isLogin();
    });

    $scope.isLogin = function () {
        $http.post('database/check_login.php')
            .success(function (data) {
                switch (data) {
                    case "admin":
                        alert("You are not login yet!");
                        $state.go('index');
                        break;
                    case "doctor":
                        break;
                    default:
                        alert("You are not login yet!");
                        $state.go('index');
                }
            });
    };

    $scope.addPatient = function () {
        $http.post('database/add_patient.php', {
            id: $scope.id,
            name: $scope.name,
            surname: $scope.surname,
            telno: $scope.telephone_num,
            sex: $scope.selectedItem,
            congi_disease: $scope.congi_disease,
            age: $scope.age,
            min: $scope.minHR,
            max: $scope.maxHR
        }).success(function (result) {
            console.log(result);
            if (result == "successful") {
                ngNotify.set('Your patient has been saved successfully.', 'success');
            } else if (result == "failed") {
                ngNotify.set('Duplicate patient id!', 'error');
            }
        });
    };
});

myApp.controller('doctorViewController', function ($scope, $http, $state, ngNotify) {
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.$on('$viewContentLoaded', function () {
        $scope.isLogin();
        $scope.loadPatients();
    });


    $scope.isLogin = function () {
        $http.post('database/check_login.php')
            .success(function (data) {
                switch (data) {
                    case "admin":
                        alert("You are not login yet!");
                        $state.go('index');
                        break;
                    case "doctor":
                        break;
                    default:
                        alert("You are not login yet!");
                        $state.go('index');
                }
            });
    };

    $scope.loadPatients = function () {
        $http.post('database/load_patient.php')
            .success(function (data) {
                $scope.patients = data;
            });
    };

    $scope.savePatient = function (data, patient_id) {
        angular.extend(data, {patient_id: patient_id});
        $http.post('database/save_patient.php', data)
            .success(function (result) {
                console.log(result);
                if (result == patient_id) {
                    console.log("Change Patient successful");
                } else {
                    console.log("Save failed");
                }
            })
    };

    $scope.removePatient = function (index) {
        $http.post('database/remove_patient.php', {
            id: $scope.patients[index].id
        })
            .success(function (data, status, headers, config) {
                //alert(data);
                ngNotify.set(data, 'success');
            });
        $scope.patients.splice(index, 1);
    };
});

myApp.directive('showTab',
    function () {
        return {
            link: function (scope, element, attrs) {
                element.click(function (e) {
                    e.preventDefault();
                    $(element).tab('show');
                });
            }
        }
    });