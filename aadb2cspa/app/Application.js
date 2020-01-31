/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('aadb2cspa.Application', {
	extend: 'Ext.app.Application',

	name: 'aadb2cspa',

	quickTips: false,
	platformConfig: {
		desktop: {
			quickTips: true
		}
	},

	init: function () {
		if (window.msalInstance.getAccount() == null) {
			window.location.reload();
		}
		window.history.replaceState({}, document.title, localStorage.getItem('temisUrl'));
	},

	launch: function () {

		window.getToken().then(response => {
			if (!Ext.isEmpty(response) && !Ext.isEmpty(response.accessToken)) {

				var headers = {
					"Authorization": Ext.String.format("Bearer {0}", response.accessToken),
					"Content-Type": "application/json"
				};

				Ext.Ajax.setDefaultHeaders(headers);

				InitialAjaxCalls.executeAjaxCalls();

				Ext.Ajax.on('requestexception', function (conn, response, options) {
					if (
						!Ext.isEmpty(response) &&
						(
							response.status == 401 &&
							(
								!Ext.isEmpty(response.getResponseHeader("Token-Expired")) &&
								response.getResponseHeader("Token-Expired") == "true"
							)
						)
					) {
						window.getToken().then(response => {
							if (!Ext.isEmpty(response) && !Ext.isEmpty(response.accessToken)) {

								var headers = {
									"Authorization": Ext.String.format("Bearer {0}", response.accessToken),
									"Content-Type": "application/json"
								};

								Ext.Ajax.setDefaultHeaders(headers);

								Ext.Ajax.request(options);
							}
						});
					}
				});
			}
		});
	},

	onAppUpdate: function () {
		Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
			function (choice) {
				if (choice === 'yes') {
					window.location.reload();
				}
			}
		);
	}
});
