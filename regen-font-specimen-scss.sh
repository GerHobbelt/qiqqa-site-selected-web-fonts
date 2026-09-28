#! /bin/bash

grep -h 'src: url' *.css | sed -e 's/src: url(\([^)]*\)).*$/<link rel="preload" href=\1 as="font" >/' > tmp.tmp

sed -E -e '/<!-- FONT-PRELOADS -->/r   tmp.tmp'  -e '/<link rel="preload"/d'   -i specimen.html
sed -E -e '/<!-- FONT-PRELOADS -->/r   tmp.tmp'  -e '/<link rel="preload"/d'   -i specimen2.html
rm tmp.tmp

rm font-specimen.scss
grep font-family *.scss -h | tr ' \t' ' ' | sed -E -e 's/font-family: //' -e 's/,.*$//' -e "s/[\"';]//g" -e 's/^ +//' -e 's/ +$//' | sort -u | sed -E -e 's#(.*)#        <option value="\1">\1</option>#' > tmp.tmp
sed -E -e '/<!-- FONT SELECT LIST -->/r   tmp.tmp'  -e '/<option value="/d'   -i specimen2.html
rm tmp.tmp

cat font-specimen.scss.source   > font-specimen.scss
./update-font-specimen-scss.sh
npx sass font-specimen.scss font-specimen.css
