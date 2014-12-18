(function() {

	var app = angular.module('inter-company', ['directives']);

	var apiURL = "http://127.0.0.1:49822";

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

		//Aux functions

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

		var getRelation = function(company1, company2) {
			var relations = erp.relations;
			for(var r in relations)//GET relations
				if(
					(relations[r].company1 == company1 && relations[r].company2 == company2) ||
					(relations[r].company1 == company2 && relations[r].company2 == company1)
				)
					return relations[r];
			return null
		}

		var hasRelation = function (company1, company2) {
			if(getRelation(company1,company2) != null)
				return true;
			return false;
		};
		erp.hasRelation = hasRelation;

		var spinner = new Spinner({top:'150%'}).spin();
		$("#spinner").append(spinner.el);//hide spinner in last $http call

		//End aux

		erp.companies = [];
		$http.get(apiURL+'/api/empresas').success(function (data) {
			erp.companies = data;
			getProducts();
			getRelations();
		});

		erp.products = [];
		var getProducts = function () {
			for(var c in erp.companies){
				var cod = erp.companies[c].codEmpresa;
				(function(cod) {
					$http.get(apiURL+'/api/artigos?codEmpresa='+cod).success(function (data) {
						for(var d in data){
							var codA = data[d].CodArtigo;
							var index = hasProduct(erp.products,codA);
							if(index != null){
								if(hasCompany(erp.products[index].empresas,cod))
									erp.products[index].empresas.push(cod)
							} else {
								var product = data[d];
								product.empresas = [cod];
								erp.products.push(product);
							}
						}
					});
				})(cod);
			}
		};
		

		erp.relations = [];
		var getRelations = function () {
			for(var c in erp.companies){
				var cod = erp.companies[c].codEmpresa;
				(function(cod) {
					$http.get(apiURL+'/api/fornecedores?codEmpresa='+cod).success(function (data) {
						for(var d in data){
							var codForn = data[d].CodFornecedor;
							if(!hasRelation(cod, codForn))
								erp.relations.push({company1: cod, company2: codForn});
						}
					});
					$http.get(apiURL+'/api/clientes?codEmpresa='+cod).success(function (data) {
						for(var d in data){
							var CodCli = data[d].CodCliente;
							if(!hasRelation(cod, CodCli))
								erp.relations.push({company1: cod, company2: CodCli});
						}
						$("#spinner").hide();
					});
				})(cod);
			}
		};


		//this.products = getProducts();//GET products
		this.orders = getOrders();//GET orders
		this.order = {};
		//this.relations = getRelations();//GET relations
		this.receipts = getReceipts();
		this.hasProduct = function (product, company) {
			for(var p in erp.products)
				if(erp.products[p].CodArtigo == product && $.inArray(company,erp.products[p].empresas) != -1)
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

		/*this.hasRelationx = function (company1, company2) {
			if(getRelation(company1,company2) != null)
				return true;
			return false;
		}*/
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
		this.orderStateDone = function(){
			for(var o in this.orders){
				if(orders[o].state == 'done')
					return true;
			}
				return false;
		}
	}]);

	// ==== DataLayer ====
	function getOrders(){
		return orders;
	}
	function getReceipts(){
		return receipts;
	}
	
	 var orders = [];
	 var receipts = [
	 {
	 	name: "receipt1",
	 	buyer: "company2",
	 	seller: "company3",
	 	state: "done"
	 }];

})();
