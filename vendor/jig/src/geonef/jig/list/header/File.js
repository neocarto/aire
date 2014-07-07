
dojo.provide('geonef.jig.list.header.File');

// parents
dojo.require('geonef.jig.list.header.Abstract');

// used in template
dojo.require('geonef.jig.list.header.generic.Selection');
dojo.require('geonef.jig.list.header.generic.Uuid');
dojo.require('geonef.jig.list.header.generic.Name');
dojo.require('geonef.jig.list.header.generic.Module');
dojo.require('geonef.jig.list.header.generic.NumberField');
dojo.require('geonef.jig.list.header.file.Actions');
dojo.require('dijit.form.TextBox');
dojo.require('geonef.jig.button.Action');
//dojo.require('geonef.jig.input.file.Upload');

// used in code
dojo.require('geonef.jig.input.file.Upload');
dojo.require('geonef.jig.workspace');

dojo.declare('geonef.jig.list.header.File', geonef.jig.list.header.Abstract,
{
  templateString: dojo.cache('geonef.jig.list.header', 'templates/File.html'),

  // sort: Object
  //    Default sort
  sort: { name: 'name', desc: false },

  createDirectory: function() {
    var name = dojo.trim(this.dirNameInput.attr('value'));
    if (!name) {
      alert('Vous devez spécifier le nom du repéertoire à créer !');
      return;
    }
    var listWidget = this.listWidget;
    listWidget.request({
      action: 'createDirectory',
      name: name,
      callback: function(data) {
        dojo.publish(listWidget.refreshTopic, [data.uuid]);
      }
    });
  },

  uploadFile: function() {
    var input = new geonef.jig.input.file.Upload(
                  { apiParams: this.listWidget.requestParams });
    input.connect(input, 'onChange', dojo.hitch(this, 'onFileUploaded'));
    geonef.jig.workspace.autoAnchorWidget(input);
    input.startup();
  },

  onFileUploaded: function() {
    var uuid = this.uploadInput.attr('value');
    dojo.publish(this.listWidget.refreshTopic, [uuid]);
  }

});
