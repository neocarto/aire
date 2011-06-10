#/bin/sh

git commit $*
for i in vendor/{cartapatate,zig,jig,ploomap-server,ploomap-client}; do
    cd $i
    git commit $*
    cd -
done
