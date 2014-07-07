dojo.provide('geonef.ploomap.start.ploomapWorkspace');

dojo.require('geonef.jig.start');

dojo.mixin(geonef.jig.start,
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
    this.buildPanel();
    this.afterPanel();
    dojo.removeClass(dojo.body(), 'loading');
    this.checkBrowser();
  },

  buildPanel: function() {
    var panel = geonef.ploomap.Panel({ id: 'panel' }, 'panel');
    panel.startup();
  },

  afterPanel: function() {
    //this.buildUserWidget();
  },

  buildUserWidget: function() {
    if (!geonef.jig.workspace.data.user) {
      var userW = new geonef.jig.button.Link(
                    { label: "Connexion", href: "/user/login",
                      title: "S'identifier au service ou créer un compte" });
      //geonef.jig.button.UserSignIn();
      dojo.addClass(userW.domNode, 'signin');
    } else {
      var userW = this.createUserStatus();
    }
    userW.placeAt('top');
    userW.startup();
  },

  createUserStatus: function() {
    return new geonef.jig.button.UserStatus();
  },

  checkBrowser: function() {
    if (!dojo.isMoz && !dojo.isChrome) {
      alert("Cette application n'a pour l'instant été testée que sur\n"
            + "les navigateurs Firefox et Google Chrome.");
    }
  }

});
