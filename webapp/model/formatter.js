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

        }

    };

}
);