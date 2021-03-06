exports.definition = {
	config: {
		"URL": require("alloy").CFG.restapi + "event" ,
		"adapter": {
			"type": "restapi" ,
			"collection_name": "events" ,
			"idAttribute": "id" ,
			"debug": 1
		} ,

		headers: {
			"_session_id": function () {
				return Ti.App.Properties.getString("acs.sessionId");
			}

		}
	} ,
	extendModel: function (Model) {

		var that = this;
		
		_.extend(Model.prototype , {
			join: function (callback) {
			    
			    Ti.API.debug("event.join:model = " + JSON.stringify(this));
			    
				var xhr = require("xhr");
				
				var headers = {};
				headers["Content-Type"] = 'text/plain';
				
				xhr.do({

					type: "PUT" ,
					url: that.config.URL + "/" + this.get("id") + "/join",
					headers: headers,
					data: JSON.stringify({"foo": "bar"})

				} , function (data) {
					Ti.API.debug(JSON.stringify(data));
					if (data.success) {
						//TODO: raise join event or whatsoever
					}
					else {

					}
					if (_opts.success) {
						Ti.API.debug("event.join success with callback ...");
						_opts.success(data);
					}
				});
			}

		});
		return Model;
	} ,
	extendCollection: function (Collection) {
		_.extend(Collection.prototype , {
		});
		return Collection;
	}

}; 