/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
(function () {
    'use strict';
    jQuery.sap.declare("com.seidor.zuxppapont.model.constants");
    com.seidor.zuxppapont.model.constants = {
        USER_DEFAULT: 'DEFAULT_USER',
        MAIN_SERVICE: '/sap/opu/odata/sap/ZPPGW_COCKPIT_APONT_OFFLINE_SRV',
        LAUNCHPAD_SERVICE: '/sap/bc/ui5_ui5/ui2/ushell/shells/abap/Fiorilaunchpad.html',
        LOGOFF_SERVICE: '/sap/public/bc/icf/logoff',
        APP_SERVICE: '/sap/bc/ui5_ui5/sap/zuxpp_apont',
        HEADER_REQUEST: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
            "DataServiceVersion": "2.0",
            "X-CSRF-Token": "Fetch",
            "Authorization": ""
        },
        TILES: [{
            "icon": "sap-icon://activity-2",
            "title": "Apontar",
            "info": "Realizar Apontamento"
        },
        {
            "icon": "sap-icon://manager-insight",
            "title": "Consultar",
            "info": "Apontamentos Realizados"
        }],
        DETAIL_HEADER: {
            "title": "6000034",
            "description": "SG300 - SEM30,PD,QM231",
            "quant1": "55 PEÇ",
            "unit1": "Confirmadas",
            "status": "Apontamento Pendente"
        },
        DETAIL_TABLE:[{
            "info1": "0010",
            "info2": "3",
            "info2_1": "Configuração Produção",
            "info3": "50",
            "info3_1": "MIN",
            "info4": "1",
            "info5": "RM124",
            "info5_1": "RAW124,VB,consumo,posição fixa",
            "info6": "",
            "info7": "100",
            "info7_1": "PEÇ"
        },
        {
            "info1": "0010",
            "info2": "1",
            "info2_1": "Horas-máquina 1",
            "info3": "150",
            "info3_1": "MIN",
            "info4": "2",
            "info5": "SG21",
            "info5_1": "SEMI21,PD,produção repetitiva",
            "info6": "",
            "info7": "1",
            "info7_1": "PEÇ"
        },
        {
            "info1": "0010",
            "info2": "11",
            "info2_1": "Horas de pessoal",
            "info3": "150",
            "info3_1": "MIN",
            "info4": "3",
            "info5": "SG25",
            "info5_1": "SEMI24,PD,FIFO lote",
            "info6": "",
            "info7": "2",
            "info7_1": "PEÇ"
        },
        {
            "info1": "0020",
            "info2": "3",
            "info2_1": "Configuração produção",
            "info3": "0",
            "info3_1": "H",
            "info4": "4",
            "info5": "SG24",
            "info5_1": "SEMI25,PD,suprimento externo",
            "info6": "",
            "info7": "3",
            "info7_1": "PEÇ"
        },
        {
            "info1": "0020",
            "info2": "11",
            "info2_1": "Horas de pessoal",
            "info3": "100",
            "info3_1": "H",
            "info4": "5",
            "info5": "",
            "info5_1": "",
            "info6": "",
            "info7": "3",
            "info7_1": "CM3"
        }]        
    };
}());
