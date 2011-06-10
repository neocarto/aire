#/bin/sh

git status
for i in vendor/{cartapatate,zig,jig,ploomap-server,ploomap-client}; do
    cd $i
    git status
    cd -
done
