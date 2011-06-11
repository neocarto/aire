#/bin/sh

for i in vendor/{cartapatate,zig,jig,ploomap-server,ploomap-client}; do
    cd $i
    echo
    echo "*** Moved to $i"
    "$@"
    cd - >/dev/null
done

echo
echo "*** Moved back to $PWD"
"$@"

exit


    for i in "$@"; do
        echo arg: $i
    done
