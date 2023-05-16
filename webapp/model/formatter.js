sap.ui.define([
    "sap/ui/core/format/NumberFormat"
], function (NumberFormat) {
    "use strict";

    return {

        formatDescription: function (pValue1, pValue2, pValue3, pValue4) {
            var oNumberFormat = NumberFormat.getFloatInstance({
                maxFractionDigits: 2,
                groupingEnabled: true,
                groupingSeparator: ".",
                decimalSeparator: ","
            });

            if (isNaN(pValue1)) {
                pValue = 0;
            }

            return oNumberFormat.format(pValue1) + " " + pValue2 + "\n" + pValue3 + "-" + pValue4;

        },

        formatDate: function(pValue1){

            if(!pValue1)
                return '';

            return pValue1 == '00000000' ? '' : pValue1.substring(6,8) + 
                                                "/" + pValue1.substring(4,6) + 
                                                "/" + pValue1.substring(0,4);
        },

        getColorStatusSend: function(pValue1){
            return !!pValue1 ? 'Success' : 'Warning';
        },

        getTextStatusSend: function(pValue1){
            return !!pValue1 ? 'Apontamento Realizado' : 'Apontamento Pendente';
        },

        getIconStatusSend: function(pValue1){
            return !!pValue1 ? 'sap-icon://sys-enter-2' : 'sap-icon://information';
        }

    };

}
);