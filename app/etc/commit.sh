#!/bin/sh

[ "$1" = "" ] && { echo "Commentaire manquant"; exit; }

for i in hurepoix/ src/vendor/{zig/,ploomap/}; do
    svn commit "$1" "$2" "$i";
done
