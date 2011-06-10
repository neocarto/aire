#/bin/sh

for i in vendor/{cartapatate,zig,jig,ploomap-server,ploomap-client}; do
    cd $i
    $*
    cd -
done
$*
