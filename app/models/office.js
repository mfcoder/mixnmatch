exports.definition = {
	config: {
	    "URL": require("alloy").CFG.restapi + "office" ,
		adapter: {
			type: "restapi" ,
			 "idAttribute": "id",
			collection_name: "offices" ,
			"DEBUG": 1, 
		},
		headers: {
		    "_session_id": function() {
		        Ti.API.debug("reading session id for office rest api: " + Ti.App.Properties.getString("acs.sessionId"));
		        return Ti.App.Properties.getString("acs.sessionId");
		    }
		}
	} ,
	extendModel: function (Model) {

		_.extend(Model.prototype , {
		});
		return Model;
	} ,
	extendCollection: function (Collection) {
		_.extend(Collection.prototype , {
		});
		return Collection;
	}

};
