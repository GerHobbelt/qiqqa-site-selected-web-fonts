#! /bin/bash

if ! test -z "$1" ; then
	if test "$1" == "sass" ; then
		DSTNAME=$( echo "$2" | sed -E -e 's/[.]scss/.css/' )
		npx sass "$2" "$DSTNAME" 
	fi
else
	rm *.scss *.css *.map
	
	find . -mindepth 1 -maxdepth 1 -type d ! -name '*_files' -a ! -name 'ttf2woff2'       -print -exec node ./create-font-scss-sourcefile.js "{}" \;
	find . -maxdepth 1 -type f -name '*.scss'                                             -print -exec node ./reprocess-font-scss-sourcefile.js "{}" \;
	find . -maxdepth 1 -type f -name '*.scss'                                             -print -exec "$0" sass "{}" \;

	grep -h 'src: url' *.css | sed -e 's/src: url(\([^)]*\)).*$/<link rel="preload" href=\1 as="font" >/' > tmp.tmp
	
	sed -E -e '/<!-- FONT-PRELOADS -->/r   tmp.tmp'  -e '/<link rel="preload"/d'   -i specimen.html
	
	cat font-specimen.scss.source   > font-specimen.scss
	./update-font-specimen-scss.sh
	npx sass font-specimen.scss font-specimen.css
fi
