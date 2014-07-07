
dojo.provide('geonef.jig.version');

geonef.jig.version = (function(v) {
                 return ''+v.major+'.'+v.minor+'.'+v.patch;
               })(dojo.version);
