sap.ui.define([
    "com/seidor/zuxppapont/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "com/seidor/zuxppapont/model/formatter",
    "com/seidor/zuxppapont/model/constants",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (  BaseController,
                JSONModel,
                formatter,
                constants,
                Filter,
                FilterOperator) {
        "use strict";

        return BaseController.extend("com.seidor.zuxppapont.controller.Main", {

            formatter: formatter,
            
            onInit: function () {
                var oViewModel;

                // Model used to manipulate control states
                oViewModel = new JSONModel({
                    tableOrders: [],
                    headerApontamento: constants.DETAIL_HEADER,
                    tableApontamentos: constants.DETAIL_TABLE,
                    UserLoged: ''
                });

                this.setModel(oViewModel, "mainView");

                this.createBancoDadosOffline();
            },

            /**
             * @override
             */
            onAfterRendering: function() {
                this._atualizaMaster();
            },

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */	
			/**
			 * @public
			 */            
            onHandleDetail: function(oEvent){
                this.byId("ID_PAGE_MAINVIEW").toDetail(this.createId("ID_DETAILPAGE_MAINVIEW"));
            },

 			/**
			 * @public
			 */ 
            onHandleBackMaster: function(oEvent){
                this.byId("ID_PAGE_MAINVIEW").toMaster(this.createId("ID_MASTERPAGE_MAINVIEW"));
            },

			/**
			 * @public
			 */ 
            onHandleDelete: function(oEvent){
                var oViewModel = this.getModel("mainView");
                oViewModel.setProperty("/headerApontamento", {});
                oViewModel.setProperty("/tableOrders", []);
                oViewModel.setProperty("/tableApontamentos", []);

                this.setDadosBancoOffline([]).then(result => { this._atualizaMaster(); }, this); 
            },

 			/**
			 * @public
			 */ 
            onHandleSearch: function(oEvent){
                var sValue = oEvent.getParameter("query");
                var oFilter = new Filter("AUFNR", FilterOperator.Contains, sValue);
                var oBinding = this.byId("ID_LIST_MAINVIEW").getBinding("items");
                oBinding.filter([oFilter]);
            },

 			/**
			 * @public
			 */             
            onHandleAddFilter:function(oEvent){
                if (!this._oDialogVHlpOrdem) {
                    this._oDialogVHlpOrdem = sap.ui.xmlfragment(this.getView().getId(),"com.seidor.zuxppapont.view.fragments.DialogVHlpOrdem", this);
                }
        
                this.getView().addDependent(this._oDialogVHlpOrdem);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogVHlpOrdem);
    
                 this._oDialogVHlpOrdem.open();  

                 var oTable = this.byId("ID_TABLE_ADDFILTER_DIALOG");
                 oTable.setModel(this.getModel());
                 //oTable.refreshAggregation("items");               
            },

 			/**
			 * @public
			 */               
            onHandleCloseFilter: function(oEvent){
                this._oDialogVHlpOrdem.destroy();
                this._oDialogVHlpOrdem = null;
            },

 			/**
			 * @public
			 */              
            onHandleSearchFilter: function(oEvent){
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("Ordem", sap.ui.model.FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },

 			/**
			 * @public
			 */              
            onHandleConfirmFilter: function(oEvent){
                
                var oDados = [],
                    oSelectedItems = oEvent.getParameter("selectedItems");

                oSelectedItems.forEach(function(oItem) {
                    
                    var sDados = oItem.getBindingContext().getObject(),
                        sPath = "/GET_VALORES_PLANEJADOSSet(ORDEM='" + sDados.Ordem + "',MOSTRAR_ERROS='X')";

                    this.sSelectedOrdem = sDados;

                    this.callApi(sPath, []).then(result => {

                        var aSelectOrdem = [];

                        if(!!result.DADOS_VLRS_PLANJ){
                            aSelectOrdem = JSON.parse(result.DADOS_VLRS_PLANJ);
                            this.getDadosBancoOffline().then(result => {

                                let sData = result.find(({ AUFNR }) => AUFNR == this.sSelectedOrdem.Ordem);

                                if(!sData){
                                    oDados = result.concat(aSelectOrdem);
                                    this.setDadosBancoOffline(oDados).then(result => { this._atualizaMaster(); }, this); 
                                }

                            }, this);
                        }
						
					    }).catch(reason => {
					    	console.log(reason);
					    }); 
                }, this);
            },

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */   
 			/**
			 * @private
			 */              
            _atualizaMaster: function(){
                var oViewModel = this.getModel("mainView"),
                    oDados = [];

                oViewModel.setProperty("/tableOrders", []);

                this.getDadosBancoOffline().then(result => {
                    result.forEach(function(oItem) {
                        let sData = oDados.find(({ AUFNR }) => AUFNR == oItem.AUFNR);
                        
                        if(!sData)
                            oDados.push(oItem);
                        
                    }, this);

                    oViewModel.setProperty("/tableOrders", oDados);
                }, this);
            }
        });
    });
