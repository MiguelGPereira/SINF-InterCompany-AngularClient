(function() {

  var app = angular.module('directives', []);

  // ==== DIRECTIVES ====
  app.directive('panels',function () {
    return {
      restrict: 'E',
      templateUrl: '../partials/panels.html',
      controller:function () {
        var level = function(){
                var cookieName = 'level';
                var value = "; " + document.cookie;
                var parts = value.split("; " + cookieName + "=");
                if (parts.length == 2) return parts.pop().split(";").shift();
        };
        this.isAdmin = function () {
          return level() == 1;
        }
        this.isClient = function () {
          return level() == 2;
        }
        this.isSupplier = function () {
          return level() == 3;
        }
        this.tab = 0;
        this.selectTab = function (setTab) {
          this.tab = setTab;
        };
        this.isSelected = function (checkTab) {
          return this.tab === checkTab;
        };
      },
      controllerAs: 'panel'
    };
  });

  app.directive('companies',function () {
    return {
      restrict: 'E',
      templateUrl: '../partials/companies.html'
    };
  });

  app.directive('products',function () {
    return {
      restrict: 'E',
      templateUrl: '../partials/products.html'
    };
  });

  app.directive('orders',function () {
    return {
      restrict: 'E',
      templateUrl: '../partials/orders.html'
    };
  });

  app.directive('receipts',function () {
    return {
      restrict: 'E',
      templateUrl: '../partials/receipts.html'
    };
  });

  app.directive('clientsSuppliers',function () {
    return {
      restrict: 'E',
      templateUrl: '../partials/clients-suppliers.html'
    };
  });

})();
