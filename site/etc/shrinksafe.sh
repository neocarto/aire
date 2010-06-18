
app_name=hurepoix
dojo_dir=/home/okapi/dev/dojo


_a=$(dirname `readlink -f $0`)
_b=`dirname $_a`
#_c=`dirname $_b`
root_site_dir=`dirname $_b`


release_name=$app_name
profile_path=$root_site_dir/$app_name/doc/$app_name.profile.js
release_dir=$root_site_dir/$app_name/cache/shrinksafe-release

buildscripts_dir=$dojo_dir/util/buildscripts

echo Building shrinksafe
echo Release name : $release_name
echo Root site dir : $root_site_dir
echo Profile path : $profile_path
echo Dojo location : $dojo_dir
echo Release dir : $release_dir

[ -d $release_dir ] && {
    echo Deleting release directory...
    rm -rf $release_dir
}

mkdir $release_dir

cd $buildscripts_dir
./build.sh action=release releaseName=$release_name profileFile=$profile_path releaseDir=$release_dir

echo Fixing NLS...
for i in $release_dir/$release_name/nls/workspace_default_*.js; do
    basename=`basename $i`
    suffix=`echo $basename | sed s/workspace_default//`
    echo -n $suffix " "
    cp $i $release_dir/$release_name/dojo/nls/$suffix
done
echo
