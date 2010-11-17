#!/bin/sh

svn up --ignore-externals . src/cartapatate src/cartapatate/zig src/cartapatate/ploomap && site/console zig:install:update-public --init=true && site/console zig:install:build-openlayers && site/console zig:install:run-shrinksafe
