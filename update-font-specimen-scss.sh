#! /bin/bash

grep -e '@import' font-specimen.scss > tmp

for f in *.scss ; do
	echo "@import \"./$f\";" >> tmp
done

sed -i -e 's/[.]scss//g' tmp

cat tmp | sort | uniq > tmp2
mv tmp2   tmp

sed -i -e '/@import/d' font-specimen.scss
cat tmp >> font-specimen.scss

rm tmp

