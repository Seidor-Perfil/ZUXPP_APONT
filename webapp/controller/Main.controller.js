sap.ui.define([
    "com/seidor/zuxppapont/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "com/seidor/zuxppapont/model/formatter",
    "com/seidor/zuxppapont/model/constants",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (  BaseController,
	JSONModel,
	formatter,
	constants,
	Filter,
	FilterOperator,
    MessageToast,
    MessageBox,
    BusyIndicator) {
        "use strict";

        return BaseController.extend("com.seidor.zuxppapont.controller.Main", {

            formatter: formatter,
            
            onInit: function () {
                var oViewModel;

                // Model used to manipulate control states
                oViewModel = new JSONModel({
                    tableOrders: [],
                    headerApontamento: {},
                    tableApontamentos: [],
                    UserLoged: ''
                });

                this.setModel(oViewModel, "mainView");
                this.createBancoDadosOffline();
                this._globalModel = this.getModel();
                this._createJob();

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

                var oItem = oEvent.getSource(),
                    oContext = oItem.getBindingContext("mainView"),
                    sOrdem = oContext.getProperty("AUFNR");
            
                this._atualizaDetail(sOrdem);
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
            onHandleBackApp: function(oEvent){
                history.go(-1);
            },

			/**
			 * @public
			 */ 
            onHandleDelete: function(oEvent){
                this._clearView(true,true);
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

                if(!this.isNetworkConnection()){
                    MessageBox.error( this.getResourceBundle().getText("messageErrorNoConnection"), 
                                        { title : this.getResourceBundle().getText("messageTitleError"),
                                          styleClass: this.getOwnerComponent().getContentDensityClass()
                                        }, this); 
                   return;
                }               
                
                if (!this._oDialogVHlpOrdem) {
                    this._oDialogVHlpOrdem = sap.ui.xmlfragment(this.getView().getId(),"com.seidor.zuxppapont.view.fragments.DialogVHlpOrdem", this);
                }
        
                this.getView().addDependent(this._oDialogVHlpOrdem);
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogVHlpOrdem);
    
                 this._oDialogVHlpOrdem.open();

                 var oTable = this.byId("ID_TABLE_ADDFILTER_DIALOG");
                 
                 oTable.setModel(this._globalModel);            

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
                
                this.getDadosBancoOffline().then(result => {

                    this._dadosBancoBeforeUpdate = result;
                
                    oSelectedItems.forEach(function(oItem, oIndex) {
                        
                        var vLastIndex = !!(oSelectedItems.length == oIndex + 1),
                            sDados = oItem.getBindingContext().getObject(),
                            sPath = "/GET_VALORES_PLANEJADOSSet(ORDEM='" + sDados.Ordem + "',MOSTRAR_ERROS='X')";
                        
                        this.callApi(sPath, []).then(result => {

                            if(!!result.DADOS_VLRS_PLANJ){
                                var oResults = JSON.parse(result.DADOS_VLRS_PLANJ);
                                this._inserirBancoOffline(oResults, vLastIndex);
                            }
                            
                            }).catch(reason => {
                                console.log(reason);
                            }); 
                    }, this);
                }, this);
            },

 			/**
			 * @public
			 */              
            onHandleSave: function(oEvent){
                var oViewModel = this.getModel("mainView"),
                    oDados = oViewModel.getProperty("/tableApontamentos");

                oDados.forEach(function(oItem, oIndex) {  
                    oDados[oIndex].APONT_FEITO = 'X';
                    this.atualizaDadosBancoOffline(oItem).then(result => {  this._atualizaMaster(); 
                                                                            this.getModel("mainView").setProperty("/tableApontamentos", oDados);}, this); 
                }, this);
                
                this._oDadosFinal = oDados;
                
                if(!!this.isNetworkConnection()){
                    this._sendDados(oDados,false);
                }else{
                    MessageBox.warning( this.getResourceBundle().getText("messageWarningSendDados"), 
                    { title : this.getResourceBundle().getText("messageTitleWarning"),
                    styleClass: this.getOwnerComponent().getContentDensityClass()
                   }, this);

                    //Armazena Dados como pendente para ser enviado posteriormente pelo Job criado
                    this._getDadosPend().then(result => {
                        var oDadosFinal = result.concat(this._oDadosFinal);
                        this._setDadosPend(oDadosFinal).then(result => {}, this); 
                    }, this); 
                                     
                }

            },

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */   
 			/**
			 * @private
			 */                
             _clearView: function(oMaster, oDetail){
                var oViewModel = this.getModel("mainView");
                
                if(oMaster)
                    oViewModel.setProperty("/tableOrders", []);

                if(oDetail)    
                    oViewModel.setProperty("/headerApontamento", {});
                    oViewModel.setProperty("/tableApontamentos", []);
            }, 			
            
            /**
			 * @private
			 */              
            _atualizaMaster: function(){
                var oViewModel = this.getModel("mainView"),
                    oDados = [];

                this._clearView(true,false);

                this.getDadosBancoOffline().then(result => {
                    result.forEach(function(oItem) {
                        let sData = oDados.find(({ AUFNR }) => AUFNR == oItem.AUFNR);
                        
                        if(!sData)
                            oDados.push(oItem);
                        
                    }, this);

                    oViewModel.setProperty("/tableOrders", oDados);
                }, this);
            },

            /**
			 * @private
			 */              
            _atualizaDetail: function(oOrdem){
                var oViewModel = this.getModel("mainView"),
                    oDados = [];

                this._SelectedOrdem = oOrdem;
                this._clearView(false,true);

                this.getDadosBancoOffline().then(result => {

                    var sHeader = result.find(({ AUFNR }) => AUFNR == this._SelectedOrdem);
                    oViewModel.setProperty("/headerApontamento", sHeader);

                    var oDados = result.filter(({ AUFNR }) => AUFNR == this._SelectedOrdem);
                    oViewModel.setProperty("/tableApontamentos", oDados);

                }, this);

            },

            /**
			 * @private
			 */             
            _inserirBancoOffline: function(pDadosAtuais, pLastRegister){

                var oDados = [],
                    oDadosAntigos = this._dadosBancoBeforeUpdate,
                    oOrdens = pDadosAtuais;

                var sData = oDadosAntigos.find(({ AUFNR }) => AUFNR == pDadosAtuais[0].AUFNR);

                if(!sData){
                    oDados = oDadosAntigos.concat(pDadosAtuais).filter(({ AUFNR }) => AUFNR !== "");
                    this._dadosBancoBeforeUpdate = oDados;
                    
                    if(!!pLastRegister)
                        this.setDadosBancoOffline(oDados).then(result => { 
                            //Delete Adjacents por Ordem
                            var oDataView = this._dadosBancoBeforeUpdate.filter((obj, index) => {
                                return index === this._dadosBancoBeforeUpdate.findIndex(o => obj.AUFNR === o.AUFNR);
                            });
                            var oViewModel = this.getModel("mainView");
                            oViewModel.setProperty("/tableOrders", oDataView);
                        }, this); 
                }

            },

            /**
			 * @private
			 */               
            _sendDados: function(pDados, pIsJob){
                var oDataModel = this._globalModel,
                    oDados = pDados,
                    vIsJob = pIsJob;
                
                var oEntry = { TAB_MENSAGEM: '',
                               DADOS_VLRS_PLANJ: JSON.stringify(oDados) };
                
                if(!vIsJob)         
                    BusyIndicator.show();

                oDataModel.create("/SET_VALORES_PLANEJADOSSet", oEntry, {
                    success: function (oData, oResponse) {

                        if(!!vIsJob){
                            oDados.forEach(function(oItem) {
                               this._removeDadosPend(oItem);
                            }, this);
                        }else{
                            BusyIndicator.hide();
                            MessageToast.show(this.getResourceBundle().getText("messageSuccessSendDados"));
                        }
                        
                        //Atualiza Valores no Banco Offline
                        var sPath = "/GET_APONTAMENTOSSet(ORDEM='" + oDados[0].AUFNR + "',DADOS_APONTAMENTO='')";
                        
                        this.callApi(sPath, []).then(result => {

                            if(!!result.DADOS_APONTAMENTO){
                                var oResults = JSON.parse(result.DADOS_APONTAMENTO);
                                
                                //Joga todas as mensagens de retorno no primeiro item
                                if(!!oResults.length)
                                    oDados[0].MESSAGE = oResults[0].MESSAGE1 + oResults[0].MESSAGE2 + oResults[0].MESSAGE3 + oResults[0].MESSAGE4 + oResults[0].MESSAGE5 + 
                                                        oResults[0].MESSAGE6 + oResults[0].MESSAGE7 + oResults[0].MESSAGE8 + oResults[0].MESSAGE9 + oResults[0].MESSAGE10 +
                                                        oResults[0].MESSAGE11 + oResults[0].MESSAGE12 + oResults[0].MESSAGE13 + oResults[0].MESSAGE14 + oResults[0].MESSAGE15;
                                
                                oDados.forEach(function(oItem) {
                                    this.atualizaDadosBancoOffline(oItem).then(result => {  if(!vIsJob){this._atualizaDetail(oDados[0].AUFNR); } }, this); 
                                }, this);
                            }
                            
                            }).catch(reason => {
                                console.log(reason);
                            });                         
                        
                    }.bind(this),
                    error: function(oError){ 

                        //Armazena Dados como pendente para ser enviado posteriormente pelo Job criado
                        if(!vIsJob){
                            BusyIndicator.hide();
                            this._getDadosPend().then(result => {
                                var oDadosFinal = result.concat(this._oDadosFinal);
                                this._setDadosPend(oDadosFinal).then(result => {}, this); 
                            }, this);
                        }
                        
                     }.bind(this)
                  });                    
            }

        });
    });
