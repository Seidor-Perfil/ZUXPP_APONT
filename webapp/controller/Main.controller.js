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
                    tableOrders: constants.TABLE_ORDERS,
                    headerApontamento: constants.DETAIL_HEADER,
                    tableApontamentos: constants.DETAIL_TABLE,
                    UserLoged: ''
                });

                this.setModel(oViewModel, "mainView");
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
            },

 			/**
			 * @public
			 */ 
            onHandleSearch: function(oEvent){
                var sValue = oEvent.getParameter("query");
                var oFilter = new Filter("title", FilterOperator.Contains, sValue);
                var oBinding = this.byId("ID_LIST_MAINVIEW").getBinding("items");
                oBinding.filter([oFilter]);
            }

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */            
        });
    });
