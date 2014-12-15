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
	app.controller("ERPController", ['$http', function($http){
		var erp = this;

		erp.companies = [];
		$http.get('http://localhost:49822/api/empresas').success(function (data) {
			erp.companies = data;
			getProducts();
		});

		erp.products = [];
		var getProducts = function () {
			for(var c in erp.companies){
				console.log("asd");
				$http.get('http://localhost:49822/api/artigos?codEmpresa='+erp.companies[c].codEmpresa).success(function (data) {
					console.log("asd2");
					var hasProduct = function(products,cod){
						for (var i = products.length - 1; i >= 0; i--) {
							if (products[i].CodArtigo == cod)
								return i;
						}
						return null;
					};
					var hasCompany = function (empresas,cod) {
						for (var i = empresas.length - 1; i >= 0; i--) {
							if (empresas[i].CodArtigo == cod)
								return true;
						}
						return false;
					};
					for(var d in data){
						var codA = data[d].CodArtigo;
						var index = hasProduct(erp.products,codA);
						if(index != null){
							if(hascompany(erp.products[index].empresas,erp.companies[c].codEmpresa))
								erp.products[index].empresas.push(erp.companies[c].codEmpresa)
						} else {
							var product = data[d];
							product.empresas = [erp.companies[c].codEmpresa];
							erp.products.push(product);
							console.log(product);
						}
					}
				});	
			}
		};
		

		

		//this.products = getProducts();//GET products
		this.orders = getOrders();//GET orders
		this.order = {};
		this.relations = getRelations();//GET relations
		this.receipts = getReceipts();
		this.hasProduct = function (product, company) {
			for(var p in erp.products)
				if(erp.products[p].CodArtigo == product && $.inArray(company,erp.products[p].empresas) != -1)
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
					(relations[r].company1 == company1.nomeEmpresa && relations[r].company2 == company2.nomeEmpresa) ||
					(relations[r].company1 == company2.nomeEmpresa && relations[r].company2 == company1.nomeEmpresa)
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
			if(this.status[companyToRelate.nomeEmpresa])
				relations.push({company1: companyRelated.nomeEmpresa, company2: companyToRelate.nomeEmpresa});//POST relation

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
			if(this.status[company.codEmpresa][product.CodArtigo])
				products[$.inArray(product,products)].companies.push(company.nomeEmpresa);
		}
	}]);

	// ==== DataLayer ====
	function getRelations(){
		return relations;
	}
	function getOrders(){
		return orders;
	}
	function getReceipts(){
		return receipts;
	}
	var relations = [
	 {
		company1: "Microsoft",
		company2: "Google"
	 },
	{
		company1: "Facebook",
		company2: "Google"
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