dojo.provide('geonef.ploomap.start.workspace');

dojo.require('cartapatate.start');

//
// UNUSED?
//
dojo.mixin(cartapatate.start,
{
  loadPackages: function() {
    dojo['require']('package.workspace');
  },

  startApplication: function() {
    geonef.jig.workspace.initialize({ data: window.workspaceData });
    var cont = new geonef.jig.layout.StackContainer({ id: 'display' }, 'display');
    var map = geonef.jig.workspace.loadWidget('map');
    cont.addChild(map);
    cont.startup();
    var size = map.map.getSize();
    var panel = geonef.ploomap.Panel({ id: 'panel' }, 'panel');
    panel.startup();
    //(new geonef.ploomap.button.Workspace()).placeAt('top').startup();
    //this.buildUserWidget();
    dojo.removeClass(dojo.body(), 'loading');
    this.checkBrowser();
  },

  buildUserWidget: function() {
    if (!geonef.jig.workspace.data.user) {
      var userW = new geonef.jig.button.Link(
                    { label: "Connexion", href: "/user/login",
                      title: "S'identifier au service ou créer un compte" });
      //geonef.jig.button.UserSignIn();
      dojo.addClass(userW.domNode, 'signin');
    } else {
      var userW = geonef.jig.button.UserStatus();
    }
    userW.placeAt('top');
    userW.startup();
  },

  checkBrowser: function() {
    if (!dojo.isMoz && !dojo.isChrome) {
      alert("Cette application n'a pour l'instant été testée que sur\n"
            + "les navigateurs Firefox et Google Chrome.");
    }
  }

});
