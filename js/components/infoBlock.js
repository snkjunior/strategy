game.components.infoBlock = {		
	templateId: null,
	
	show: function(infoBlockTemplateId, data = {}, isAddDisabledBg = true, callback = function(){}) {
		if (game.infoBlockTemplates[infoBlockTemplateId]) {
            this.templateId = infoBlockTemplateId;
            var template = game.infoBlockTemplates[infoBlockTemplateId];
            
			$('#interface').append("<div class='infoBlock' style='"+this.formBlockStyles(template)+"' id='template_" + infoBlockTemplateId + "'>" + template.html + "</div>");
            ko.renderTemplate("template_" + infoBlockTemplateId, data, {}, document.getElementById("template_" + infoBlockTemplateId));		
            
            if (isAddDisabledBg) {
                $('#interface').append("<div class='infoBlockBg' id='template_bg_" + infoBlockTemplateId + "' onclick='game.components.infoBlock.hide()'></div>");
            }
        
            if (callback) {
                callback();
            }
        }
	},
    
    formBlockStyles: function(template) {
        var style = "";
        if (template.width) {
            style += "width: " + template.width + "px;";
            style += "left: " + (game.screen.width - template.width) / 2 + "px;";
        }
        if (template.height) {
            style += "height: " + template.height + "px;";
            style += "top: " + (game.screen.height - template.height) / 2 + "px;";
        }
        return style;
    },
	
	hide: function() {
		$('#template_' + this.templateId).remove();
        $('#template_bg_' + this.templateId).remove();
	}
};