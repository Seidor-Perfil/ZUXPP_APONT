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
        }]     
    };
}());
