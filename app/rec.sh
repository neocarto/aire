#/bin/sh

for i in vendor/{cartapatate,zig,jig,ploomap-server,ploomap-client}; do
    cd $i
    echo
    echo "*** Moved to $i"
    $*
    cd -
done

echo
echo "*** Moved back to $PWD"
$*
