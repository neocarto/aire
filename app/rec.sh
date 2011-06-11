#/bin/sh

for i in vendor/{cartapatate,zig,jig,ploomap-server,ploomap-client}; do
    cd $i
    echo
    echo "*** Moved to $i"
    "$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9"
    cd - >/dev/null
done

echo
echo "*** Moved back to $PWD"
"$1" "$2" "$3" "$4" "$5" "$6" "$7" "$8" "$9"
