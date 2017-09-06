game.components.infoBlock = {		
	templateId: null,
	template: null,
	data: null,

	show: function(infoBlockTemplateId, data, callback) {
		this.templateId = infoBlockTemplateId;
		this.template = game.infoBlockTemplates[infoBlockTemplateId];
		this.data = data;
		
		$('#interface').append(this.template);
		ko.renderTemplate(infoBlockTemplateId, data, {}, document.getElementById(infoBlockTemplateId));		
	
		if (callback) {
			callback();
		}
	},
	
	hide: function() {
		$('#' + this.templateId).remove();
	}
};