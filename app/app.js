(function() {

	var app = angular.module('inter-company', ['directives']);

	// === Auth ===
	$('#loginAdmin').click(function () {
		document.cookie = 'level=1';
	});
	$('#loginClient').click(function () {
		document.cookie = 'level=2';
	});
	$('#loginSupplier').click(function () {
		document.cookie = 'level=3';
	});

	// ==== Controllers ====
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

	// ==== DataLayer ====
	function getCompanies(){
		return companies;
	}
	function getRelations(){
		return relations;
	}
	function getProducts(){
		return products;
	}
	function getOrders(){
		return orders;
	}
	function getReceipts(){
		return receipts;
	}
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
	 var orders = [
	 {
	 	name: "order1",
	 	buyer: "company1",
	 	seller: "company2",
	 	state: "done"
	 },
	 {
	 	name: "order2"
	 	buyer: "company2",
	 	seller: "company3",
	 	state: "done"
	 }];
	 var receipts = [
	 {
	 	name: "receipt1",
	 	buyer: "company2",
	 	seller: "company3",
	 	state: "done"
	 }];

})();
