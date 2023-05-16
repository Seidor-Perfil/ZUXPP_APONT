sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/seidor/zuxppapont/model/constants",
	"sap/ui/core/BusyIndicator"
], function(
        Controller,
        JSONModel,
		constants,
		BusyIndicator,

) {
	"use strict";

	return Controller.extend("com.seidor.zuxppapont.controller.BaseController", {
			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},

			/**
			 * Convenience method for getting the view model by name.
			 * @public
			 * @param {string} [sName] the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				if(sName){
					return this.getView().getModel(sName);
				}else{
					if(this.isStandAlone()){
						return new sap.ui.model.odata.v2.ODataModel( this.getHost() + constants.MAIN_SERVICE + '/?sap-client=050', 
																		{ headers:{"X-Requested-With":"X",
																			   	   "Authorization": "BASIC " + this._getAuthorization() }});
					}else{
						return new sap.ui.model.odata.v2.ODataModel(constants.MAIN_SERVICE, {headers:{"X-Requested-With":"X"}});
					}
				}

				

			},

			/**
			 * Convenience method for setting the view model.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},
			
			/**
			 * Getter for the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },

			/**
			 * @public
			 */	
			createBancoDadosOffline: function(){
				//Create required DBs
				PouchDB("dbPouch");
				PouchDB("dbPouchPendSend");
			},
			
			/**
			 * @public
			 */			
			getDadosBancoOffline: function(){
				return new Promise(function(resolve, reject) {
					var db = PouchDB("dbPouch");
					
					db.get("Ordem").then(function (doc) {
						var aList = [];
						
						doc.Content.forEach(function(oEntry){ 
							//oEntry.DataEntrega = new Date(oEntry.DataEntrega);
							aList.push(oEntry);
		    			}, this);
						
						resolve(aList);
					}).catch(function (err) {
						resolve([]);
					});
					
				});
			},
			
			/**
			 * @public
			 */			
			setDadosBancoOffline: function(oDados){
				var db = PouchDB("dbPouch");
				
				return new Promise(function(resolve, reject) {
					db.destroy().then(function () {
						db = new PouchDB("dbPouch");
						db.put({ _id: "Ordem",
								 Content: oDados });
						resolve();
					}.bind(this));
				}.bind(this));
			},
			
			/**
			 * @public
			 */	
			atualizaDadosBancoOffline: function(oData){
				return new Promise(function(resolve, reject) {
					var oDados = [];
					
					this.getDadosBancoOffline().then(result => {
						oDados = result;
						
						oDados.forEach(function(oEntry, oIndex){ 
		    				if(oEntry.AUFNR === oData.AUFNR && oEntry.SEQ === oData.SEQ)
		    					oDados[oIndex] = oData;
		    			}, this);
						
						this.setDadosBancoOffline(oDados).then(result => {
							resolve();
						}, this);
						
					}, this);
					
				}.bind(this));
			},
			
			/**
			 * @public
			 */			
			removeDadosBancoOffline: function(oData){
				return new Promise(function(resolve, reject) {
					var oDados = [];
					
					this.getDadosBancoOffline().then(result => {
						oDados = result;
						
						oDados = oDados.filter(function(oEntry){
							return oEntry.AUFNR !== oData.AUFNR;
						});
						
						this.setDadosBancoOffline(oDados).then(result => {
							resolve();
						}, this);
						
					}, this);
					
				}.bind(this));
			},

			/**
			 * @public
			 */	
			_setDadosPend: function(oDados){			
				var db = PouchDB("dbPouchPendSend");
				
				return new Promise(function(resolve, reject) {
					db.destroy().then(function () {
						db = new PouchDB("dbPouchPendSend");
						db.put({ _id: "DadosPend",
							 	 Content: oDados });
						resolve();
					}.bind(this));
				}.bind(this));
			},
			
			/**
			 * @public
			 */			
			_getDadosPend: function(){
				return new Promise(function(resolve, reject) {
					var db = PouchDB("dbPouchPendSend");
					
					db.get('DadosPend').then(function (doc) {
						resolve(doc.Content);
					}).catch(function (err) {
						resolve([]);
					});
					
				});
			},

			/**
			 * @public
			 */			
			_removeDadosPend: function(oData){
				return new Promise(function(resolve, reject) {
					var oDados = [];
					
					this._getDadosPend().then(result => {
						oDados = result;
						
						oDados = oDados.filter(function(oEntry){
							return oEntry.AUFNR !== oData.AUFNR;
						});
						
						this._setDadosPend(oDados).then(result => {
							resolve();
						}, this);
						
					}, this);
					
				}.bind(this));
			},			
			
			/**
			 * @public
			 */	
			isNetworkConnection: function () {
		    	return navigator.onLine;
		    },
		    
			/**
			 * @public
			 */	
		    isUserLogged: function()  {
		    	return sap.ushell.Container.getService("UserInfo").getId() !== constants.USER_DEFAULT;
		    },
		    
			/**
			 * @public
			 */	
			_getUserIdLogged: function(){
				return new Promise(function(resolve, reject) {
						
					this._getParams().then(result => {
						if(this.isStandAlone()){
							resolve(result.Uname);
						}else{
							resolve(sap.ushell.Container.getService("UserInfo").getId());
						}
					}, this);
						
					}.bind(this)).catch(function (err) {
						resolve([]);
				});
			},
		    
			/**
			 * @public
			 */	
		    isStandAlone: function()  {
		    	var sProtocol = location.protocol;
		    	return sProtocol.indexOf("file") !== -1;
		    },
			
			/**
			 * @public
			 */
			getHost: function(){
				var sProtocol = location.protocol;
				var vHost;
				
				if(this.isStandAlone()){					//App install
					vHost = fiori_client_appConfig.fioriURLHttps.replace(constants.LAUNCHPAD_SERVICE,'');
				}else{										//Fiori Client or Launchpad
					var vSlashes = sProtocol.concat("//");
					var vHost = vSlashes.concat(window.location.hostname);
					
					if(window.location.port){
						var vDoublePoint = vHost.concat(":");
						vHost = vDoublePoint.concat(window.location.port);
					}
				}
				
				return vHost;
			},
			
			/**
			 * public
			 */	
			callApi: function(sPath, aFilters) {
				
				var sHeaders = constants.HEADER_REQUEST;
				//sHeaders['Authorization'] =  "BASIC " + this._getAuthorization();
				
				
				BusyIndicator.show();
				
				return new Promise(function(resolve, reject) {			
					OData.request({ requestUri : this.getHost() + constants.MAIN_SERVICE + sPath,
									method 	   : "GET",
									//user	   : 'abcd',//sVault[0], 
									//password   : '1234',//sVault[1],
									filters    : aFilters
									//headers	   : sHeaders
								   },
								   function (oData, oResponse) {
									    BusyIndicator.hide();
										resolve(oData);							
									},
									function(error) {
										BusyIndicator.hide();
										reject(error);
								   });
				}.bind(this));
			},
			
			/**
			 * public
			 */	
			_logout: function(){
				window.localStorage.clear();
				
				if(this.isNetworkConnection()){
					var oModel = new sap.ui.model.json.JSONModel();			
					oModel.loadData(this.getHost() + "/sap/public/bc/icf/logoff");
				}
			},

			/**
			 * public
			 */	
			_setAuthorization: function (user, password) {
				
				var criptedAuth = null;
				
				if (user && password) {
					user = user.toUpperCase();
					criptedAuth = window.btoa(user + ":" + password);
				}

				window.localStorage.setItem("AuthToken", JSON.stringify(criptedAuth));
			},

			/**
			 * public
			 */	
			_getAuthorization: function () {
				return fiori_client_appConfig.authUser; //window.btoa(user + ":" + password)
			},
			
			/**
			 * public
			 */	            
			_createJob: function(){
				setInterval(function(){this._startJob()}.bind(this), 60000);
			},

			/**
			 * public
			 */	            
			_startJob: function(){

				var sTimer = 0;

				if(!this.isNetworkConnection())
					return;

				this._getDadosPend().then(result => {
					
					if(!result.length)
						return;
					
					//Delete Adjacents por Ordem
					var oDataOrdem = result.filter((obj, index) => {
						return index === result.findIndex(o => obj.AUFNR === o.AUFNR);
					});

					oDataOrdem.forEach(function(oItem) {
						
						var oDados = result.filter(({ AUFNR }) => AUFNR == oItem.AUFNR);
						
						//Descarga por ordem de 10 em 10 segundos
						sTimer += 10000;
						
						setTimeout(function(){this._sendDados(oDados, true)}.bind(this), sTimer);
						
					}, this);

				}, this);             

			}			
			        
	});
});