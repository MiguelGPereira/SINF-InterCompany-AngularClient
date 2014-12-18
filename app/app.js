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
		var verifyOrder = function(order){
			if(order.companyFrom == null || order.companyTo == null || order.companyFrom == order.companyTo)
				return false;
			return true;
		}
		this.addOrder = function () {
			this.order.state = 'pending'
			//console.log(this.order);
			for(var p in this.order.products){
			//	console.log("in for");
				if (this.order.products[p].quantity == null){
					delete this.order.products[p];
			//		console.log("antes"+this.order.products[p].name);
					/*this.order.products = $.grep(this.order.products, function (value) {
						return value != this.order.products[p]; 
					});*/
					//console.log("depois");
				}
				

			}
			//console.log(this.order);
			if(verifyOrder(this.order)){
				this.orders.push(this.order);//POST order
				this.order = {};
			}
			else
				alert("Can't order. You must fill all the fields. \n\nCan't order from yourself");
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
		this.orderStateDone = function(){
			for(var o in this.orders){
				if(orders[o].state == 'done')
					return true;
			}
				return false;
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
		name: "SuperChargers"
	},
	{
	  	name: "Xamexung"
	},
	{
		name: "PerfectGlass"
	}];
	var relations = [
	 {
		company1: "SuperChargers",
		company2: "Xamexung"
	 },
	{
		company1: "Xamexung",
		company2: "PerfectGlass"
	}];
	 var products = [
	 {
		name: "bateria litio RM600",
		companies: ["SuperChargers"],
		price: "3$"
	 },
	 {
		name: "bateria litio FM6250",
		companies: ["SuperChargers"],
		price: "15$"
	 },
	 {
		name: "bateria litio M300",
		companies: ["SuperChargers"],
		price: "12$"
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
