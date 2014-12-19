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

		var getCompany = function (cod) {
			for (var c in erp.companies) {
				if (erp.companies[c].codEmpresa == cod)
					return erp.companies[c];
			}
			return null;
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

		var productsOfCompanies = function (codA,codB){
			var productCompanies = [];
			for(var p in erp.products){
				if($.inArray(codA,erp.products[p].empresas)!= -1 && $.inArray(codB,erp.products[p].empresas)!= -1)
					productCompanies.push(erp.products[p]);
			}
			return productCompanies;
		};
		erp.productsOfCompanies = productsOfCompanies;

		var spinner = new Spinner({top:'150%'}).spin();
		$("#spinner").append(spinner.el);//hide spinner in last $http call

		//End aux

		erp.companies = [];
		$http.get(apiURL+'/api/empresas').success(function (data) {
			erp.companies = data;
			getProducts();
			getRelations();
			getOrders();
			getReceipts();
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
								erp.products[index].empresas.push(cod);
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
		erp.addProduct = function(product, company){
			var empresas = product.empresas;
			delete product.empresas;
			delete product.$$hashKey;
			$http({
				url: apiURL+'/api/artigos/'+company.codEmpresa,
				method: "POST",
				data: product,
				headers: {'Content-Type': 'application/json'}
			}).success(function () {
			});
			empresas.push(company.codEmpresa);

			for(var p in erp.products)
				if(erp.products[p].CodArtigo == product.CodArtigo)
					erp.products[p].empresas = empresas;

		}

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

					});
				})(cod);
			}
		};
		var setRelation = function (company1, company2) {
			$("#spinner").show();
			$http({//add company2 as client to company1
				url: apiURL+'/api/clientes/'+company1,
				method: "POST",
				data: {"CodCliente": company2,"NomeCliente": getCompany(company2).nomeEmpresa,"NumContribuinte": "8765", "Moeda":"EUR"},
				headers: {'Content-Type': 'application/json'}
			}).success(function () {
			});
			$http({//add company2 as supplier to company1
				url: apiURL+'/api/fornecedores/'+company1,
				method: "POST",
				data: {"CodFornecedor": company2,"NomeFornecedor": getCompany(company2).nomeEmpresa,"NumContribuinte": "8765","NomeFiscal": getCompany(company2).nomeEmpresa,"Moeda":"EUR"},
				headers: {'Content-Type': 'application/json'}
			}).success(function () {
			});
			$http({//add company1 as client to company2
				url: apiURL+'/api/clientes/'+company2,
				method: "POST",
				data: {"CodCliente": company1,"NomeCliente": getCompany(company1).nomeEmpresa,"NumContribuinte": "12345", "Moeda":"EUR"},
				headers: {'Content-Type': 'application/json'}
			}).success(function () {
			});
			$http({//add company1 as supplier to company2
				url: apiURL+'/api/fornecedores/'+company2,
				method: "POST",
				data: {"CodFornecedor": company1,"NomeFornecedor": getCompany(company1).nomeEmpresa,"NumContribuinte": "12345","NomeFiscal": getCompany(company1).nomeEmpresa, "Moeda":"EUR"},
				headers: {'Content-Type': 'application/json'}
			}).success(function () {
				erp.relations.push({company1: company1, company2: company2});//only once
				$("#spinner").hide();
			});
		};
		erp.setRelation = setRelation;

		erp.orders = [];
		var getOrders = function () {
			for(var c in erp.companies){
				var cod = erp.companies[c].codEmpresa;
				(function(cod) {
					$http.get(apiURL+'/api/docCompra?codEmpresa='+cod+'&tipoDeDocumento=ECF').success(function (data) {
						for(var d in data){
							data[d].from = cod;
							data[d].state = "pending";
							erp.orders.push(data[d]);
						}
					});
				})(cod);
			}
		};

		erp.receipts = [];
		var getReceipts = function () {
			for(var c in erp.companies){
				var cod = erp.companies[c].codEmpresa;
				(function(cod) {
					$http.get(apiURL+'/api/docVenda?codEmpresa='+cod+'&tipoDeDocumento=FA').success(function (data) {
						for(var d in data){
							data[d].from = cod;
							data[d].state = "done";
							erp.receipts.push(data[d]);
						}
						$("#spinner").hide();
					});
				})(cod);
			}
		};




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
			this.order.state = 'pending';
			for(var p in this.order.products){
				if (this.order.products[p].Quantidade == null){
					delete this.order.products[p];
				}
			}
			if(verifyOrder(this.order)){
				var docEnc = {};
				docEnc.Entidade = this.order.companyTo.codEmpresa;
				docEnc.NumDocExterno = "1";
				//docEnc.NumDoc = erp.receipts[erp.receipts.length-1].NumDoc + 1;
				//docEnc.Data = "2014-11-21T00:00:00";
				//docEnc.TotalMerc = 0;
				docEnc.Serie = "A";
				docEnc.LinhasDoc = [];
				for(var p in this.order.products){
					var prod = {};
					prod.CodArtigo = this.order.products[p].CodArtigo;
					prod.Quantidade = parseInt(this.order.products[p].Quantidade);
					prod.Desconto = 0;
					prod.PrecoUnitario = parseInt(this.order.products[p].PrecoUnitario);
					prod.Armazem = "A1";
					docEnc.LinhasDoc.push(prod);
				}
				docEnc.tipoDoc = "ECF";
				this.orders.push(docEnc);
				//POST order
				$http({//add ECF to companyFrom
					url: apiURL+'/api/docCompra/'+this.order.companyFrom.codEmpresa,
					method: "POST",
					data: docEnc,
					headers: {'Content-Type': 'application/json'}
				}).success(function () {
				});
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

		this.orderStateDone = function(){
			for(var o in this.orders){
				if(this.orders[o].state == 'done')
					return true;
			}
				return false;
		}
	}]);


})();
