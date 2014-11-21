(function() {

	var app = angular.module('sinf4', []);

	// ==== CONTROLLERS ====
	app.controller("ERPController", function(){
		this.companies = companies;
		this.products = products;
		this.order = {};
		this.orders = orders;
		this.hasProduct = function (product, company) {
			for(var p in products)
				if(products[p].name == product && $.inArray(company,products[p].companies) != -1)
					return true;
			return false;
		};
		this.addOrder = function () {
			this.orders.push(this.order);
			this.order = {};
		};
	});

	// ==== DIRECTIVES ====
	app.directive('panels',function () {
		return {
			restrict: 'E',
			templateUrl: 'panels.html',
			controller:function () {
				this.tab = 1;
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
			templateUrl: 'companies.html'
		};
	});

	app.directive('products',function () {
		return {
			restrict: 'E',
			templateUrl: 'products.html'
		};
	});

	app.directive('orders',function () {
		return {
			restrict: 'E',
			templateUrl: 'orders.html'
		};
	});

	// ==== DB ====
	var companies = [
	{ 
		name: "Microsoft" 
	},
	{
	  	name: "Google"
	 }];

	 var relations = [
	 {
	 	company1: "Microsoft",
	 	company2: "Google",
	 	isRelated: true
	 }];

	 var products = [
	 {
	 	name: "cobre",
	 	companies: ["Microsoft","Google"]
	 },
	 {
	 	name: "basalto",
	 	companies: ["Google"]
	 }];

	 var orders = [];

	 var receipts = [];

})();

