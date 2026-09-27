#! /bin/bash

grep -v -e '@import' font-specimen.scss > tmp

for f in *.scss ; do
	if test "$f" != "font-specimen.scss" ; then 
		echo "@import \"./$f\";" | sed -e 's/[.]scss//g' >> tmp
	fi
done

cat tmp > font-specimen.scss

rm tmp

