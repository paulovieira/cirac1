window.Behaviors = window.Behaviors || {};

window.Behaviors.ShowModal = Marionette.Behavior.extend({

    events: function(){
    	var eventsHash = {};
    	eventsHash["click @ui." + this.options.uiKey] = "showModal";

    	return eventsHash;
    },

    showModal: function(x,y,z){

        var modalEl = "$modal1",
        	regionKey = "modal1Region";

        if(this.options.stackLevel === 2){
			modalEl = "$modal2";
			regionKey = "modal2Region";
        }

        var view = new this.options.viewClass({
            model: this.view.model
        });

        // first set the content of the modal
        Dashboard[regionKey].show(view);

        // then show the modal 
        Dashboard[modalEl].modal("show");
    },
});




// close the modal and destroy the view
window.Behaviors.CloseModal = Marionette.Behavior.extend({

    // behaviors have events that are bound to the views DOM
    events: {
        "click @ui.modalCloseBtn": "closeModal",
    },

    closeModal: function(){
        var modalEl = (this.options.stackLevel === 2 ? "$modal2" : "$modal1");

		Dashboard[modalEl].modal("hide");
		this.view.destroy();
    },

});




// deletes the resource, close the modal and destroy the view
window.Behaviors.DeleteResourceAndCloseModal = Marionette.Behavior.extend({

    // behaviors have events that are bound to the views DOM
    events: {
        "click @ui.modalDeleteBtn": "deleteResource"
    },

	deleteResource: function(){

		// NOTE: we should always use model.destroy({wait: true}) instead of simply model.destroy();  
		// this way the model will be destroyed (in the client) only after we get a 200 response
		// from the server (meaning the row has actually been deleted)

		this.ui.modalDeleteBtn.prop("disabled", true);

		var self = this;
		Q.delay(150)
			.then(function(){
				return self.view.model.destroy({ wait: true });  // returns a promise
			})
			.catch(function(err){
debugger;
				var msg = err.responseJSON ? err.responseJSON.message : 
											( err.message ? err.message : "unknown error" );

				// if the model has been deleted in the server in the meantime we get a 404; 
				// the destroy() method in the above handler will not delete the model from the 
				// collection (because of the wait:true option);
				// the collection in the client will then be outdated so we call destroy again to remove 
				// the deleted model from the collection; we also abort the ajax request immediately 
				// because we are not interested in the response

				if(err.responseJSON && err.responseJSON.statusCode === 404){
					self.view.model.destroy().abort();
				}

				alert("ERROR: " + msg);
				throw new Error(msg);
			})
			.finally(function(){
		        var modalEl = (self.options.stackLevel === 2 ? "$modal2" : "$modal1");
				
				Dashboard[modalEl].modal("hide");
				self.view.destroy();
			})
			.done();
	}

});

var ModalMixins = {
	ui: {
		"modalCloseBtn":  "button.js-modal-cancel",
		"modalDeleteBtn": "button.js-modal-delete",
		"modalSaveBtn":   "button.js-modal-save"
	}	
};

var ModalIV = Mn.ItemView.extend({
	ui: {
		"modalCloseBtn":  "button.js-modal-cancel",
		"modalDeleteBtn": "button.js-modal-delete",
		"modalSaveBtn":   "button.js-modal-save"
	},
});
