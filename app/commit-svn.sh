#!/bin/sh

for i in . src/cartapatate src/cartapatate/zig src/cartapatate/ploomap; do
    echo svn commit $i -m "\"$*\"";
    svn commit $i -m "$*";
done
