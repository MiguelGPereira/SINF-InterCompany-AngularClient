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
		this.companies = getCompanies();//GET companies
		this.products = getProducts();//GET products
		this.orders = getOrders();//GET orders
		this.order = {};
		this.relations = getRelations();//GET relations
		this.receipts = getReceipts();
		this.hasProduct = function (product, company) {
			for(var p in products)
				if(products[p].name == product && $.inArray(company,products[p].companies) != -1)
					return true;
			return false;
		};
		this.addOrder = function () {
			this.order.state = 'pending'
			this.orders.push(this.order);//POST order
			this.order = {};
		};
		this.companyRelated= {};
		this.isCompanySelected = function () {
			var isSelected = !$.isEmptyObject(this.companyRelated);
			return isSelected;
		}
		var getRelation = function(company1, company2) {
			for(var r in relations)//GET relations
				if(
					(relations[r].company1 == company1.name && relations[r].company2 == company2.name) ||
					(relations[r].company1 == company2.name && relations[r].company2 == company1.name)
				)
					return relations[r];
			return null
		}
		this.hasRelation = function (company1, company2) {
			if(getRelation(company1,company2) != null)
				return true;
			return false;
		}
		this.changeRelation = function (companyRelated, companyToRelate) {
			if(this.status[companyToRelate.name])
				relations.push({company1: companyRelated.name, company2: companyToRelate.name});//POST relation

		}
		this.newReceipt = function (order) {
			var receipt = {};
			receipt.companyFrom = order.companyTo;
			receipt.companyTo = order.companyFrom;
			receipt.product = order.product;
			receipts.push(receipt);
			var index = $.inArray(order, this.orders);
			this.orders[index].state = 'done';
		}
		this.setModal = function(){
			$('#newReceiptModal').appendTo("body").modal("show");
		}
		this.addProduct = function(product, company){
			if(this.status[company.name][product.name])
				products[$.inArray(product,products)].companies.push(company.name);
		}
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
	},
	{
		name: "Facebook"
	}];
	var relations = [
	 {
		company1: "Microsoft",
		company2: "Google"
	 },
	{
		company1: "Facebook",
		company2: "Google"
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
	 var receipts = [
	 {
	 	name: "receipt1",
	 	buyer: "company2",
	 	seller: "company3",
	 	state: "done"
	 }];

})();
