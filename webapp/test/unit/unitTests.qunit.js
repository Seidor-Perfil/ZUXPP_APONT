/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comseidor/zuxpp_apont/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
