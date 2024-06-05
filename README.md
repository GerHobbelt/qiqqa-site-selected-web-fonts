# site-selected-web-fonts

selected OFL fonts for website(s): not just for Qiqqa's, but also some other projects.


## How to (re)build the specimen page and accompanying CSS

Make sure you've installed `sass` via

```
npm install sass
```

or equivalent. 

> ## Warning Notice
>
> Use Dart/JS-based `sass` NPM package instead of `node-sass` NPM package as the latter will require a gyp/python2+gcc C code compile phase, which will *fail* (ERROR) on Windows dev boxes with high probability.
> 
> Mine, for example, has all the goodies, but I have *explicitly removed antique Python2* on the dev box to prevent obnoxious faults in other dev work and I'm simply *unwilling* to fiddle with flaky switchable setups just to accomodate `node-sass`, so that one is *out*. The `sass` package, however, does *not* suffer from this partial-native-compile-phase-with-old-python shite, so we'll go with that one. It works, it's up to date, so we're good to go.
> 

Then run `sass` using shell commands such as this

```
echo "--- build font specimen sample pages ---"

npx sass font-specimen.scss font-specimen.css

echo done.
```

and your `specimen.html` specimen page+CSS should be ready.

## Updating `font-specimen.html` after you've edited the font set

Script to produce thee `link preload` statements from the generated `font-specimen.css` file:

```sh
( for f in $( cat docs-src/_meta/fonts/*.css ) ; do echo $f ; done ) | grep 'url' | sed -e 's/url(\([^)]*\)).*$/<link rel="preload" href=\1 as="font" >/' > tmp.tmp
```

and then replace the bunch with the set in file `tmp.tmp`, e.g. via visual diff tooling.




## Other places and software

- https://coding-fonts.netlify.app/fonts/inconsolata/ -- for previewing various monospaced fonts. Nive iterface.
