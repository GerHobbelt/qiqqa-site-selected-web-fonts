
const path = require("path");
const fs = require("fs");
const g = require('glob');

//console.log({ argv: process.argv });

let rootdir = process.argv[2]
.replace(/[\\/]$/, '');

console.log("Processing directory:", rootdir);


function cleanup4glob(p) {
    let rv = p
    .replace(/^.*[\/\\]/g, '')
    .replace(/\*\*+/g, '*')
    .replace(/[\[\], _-]/g, '?');
    //console.log({p, rv});
    return rv;
}

function cleanup_for_reconstruct(p) {
    return p
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\\/g, '/');
}

function cleanup_for_SCSS_filename(fp, suffix) {
    let p = path.basename(fp);
    let n = p
    .replace(/[\[].*$/g, '')
    .replace(/Variable$/, '')
    .replace(/FontSet$/, '')
    .replace(/webfont$/, '')
    .replace(/Thin|SemiBold|Semibold|DemiBold|Demi-Bold|Regular|Demi|Medium|Extra-Light|ExtraLight|UltraLight|Light|ExtraBold|Extra-Bold|Bold|-bold|Black|Heavy|BdIta/, '')
    .replace(/[-]?Italic/i, '')
    .replace(/[-]?Oblique/i, '')
    .replace(/[.-]regular/, '')
    .replace(/[._ -]+/g, ' ')
    // and some special name tweaks:
    .replace(/([0-9])([A-Z])/g, '$1 $2')        // 3270 fonts
    .replace(/([a-z])([A-Z])/g, '$1 $2')        // camelCased font filenames
    .replace(/([A-Z][A-Z][A-Z][A-Z]?)([A-Z][a-z])/g, '$1 $2')          // URW fonts, others...
    .replace(/[0-9][. ][0-9]+[ ]?$/g, '')       // ditch version numbers
    .replace(/\bD DIN/ig, 'D-DIN')              // D-DIN fonts
    .replace(/ +/g, ' ')
    .trim()
    .replace(/ /g, '.');
    // and some special name tweaks:
	if (n === "font") {
		n = "Cal Sans";
	}
	// fontnames cannot start with a digit!  :-(
	n = n
	.replace(/^01/, "N01")
	.replace(/^3270/, "IBM3270");
	n += suffix;
    console.log("SCSS name", p, "+", suffix, "-->", n);
    return n;
}

function cleanup4fontname(fp) {
    let p = path.basename(fp);
	let attrs = /\[([^\]\/]+)\]/.exec(p);
	//console.log('attrs? :: ', p, ' --> ', attrs);
	if (attrs) {
		attrs = attrs[1];
	}
	else {
		attrs = undefined;
	}
    let n = p
    .replace(/[\[].*$/g, '')
    .replace(/[.]ttc$/, '')
    .replace(/[.]ttf$/, '')
    .replace(/[.]otf$/, '')
    .replace(/VariableFont_[a-zA-Z,]*wght/, 'Variable')
    .replace(/\bVar$/, '')
    .replace(/Variable$/, '')
    .replace(/FontSet$/, '')
    .replace(/webfont$/, '')
    .replace(/Thin|SemiBold|Semibold|DemiBold|Demi-Bold|Regular|Demi|Medium|Extra-Light|ExtraLight|UltraLight|Light|ExtraBold|Extra-Bold|Bold|-bold|Black|Heavy|BdIta/, '')
    .replace(/[-]?Italic/i, '')
    .replace(/[-]?Oblique/i, '')
    .replace(/[.-]regular/, '')
    .replace(/[._ -]+/g, ' ')
    // and some special name tweaks:
    .replace(/([0-9])([A-Z])/g, '$1 $2')        // 3270 fonts
    .replace(/([a-z])([A-Z])/g, '$1 $2')        // camelCased font filenames
    .replace(/([A-Z][A-Z][A-Z][A-Z]?)([A-Z][a-z])/g, '$1 $2')          // URW fonts, others...
    .replace(/[0-9][. ][0-9]+[ ]?$/g, '')       // ditch version numbers
    .replace(/\bD DIN/g, 'D-DIN')               // D-DIN fonts
    .replace(/Bodoni It/, 'Bodoni')
    .replace(/KOMTXT/, 'Komika Text ')
    .replace(/KOMTXK/, 'Komika Text K')
    .replace(/KOMIKS/, 'Komika Slick ')
    .replace(/KOMIKA/, 'Komika ')
    .replace(/KOMIK/, 'Komika ')
    .replace(/KMKDSP/, 'Komika Display ')
    .replace(/KMKDSK/, 'Komika Display K')
    .replace(/FahKwang/i, 'Fah Kwang')
    .replace(/ +/g, ' ')
    .trim();
    // and some special name tweaks:
	if (n === "font") {
		n = "Cal Sans";
	}
	if (fp.includes('CF-D-DIN')) {
		// second D-DIN Pro font set: make sure these are uniquely identifiable!
		n = "CF-" + n;
	}
	// fontnames cannot start with a digit!  :-(
	n = n
	.replace(/^01/, "N01")
	.replace(/^3270/, "IBM3270");
	if (attrs) {
		attrs = ' ' + attrs.toUpperCase().replace(/,/g, '.');
		n += attrs;
	}
    console.log("cleanup4fontname", p, "-->", n, "         +w:", name2weight(p), ', attrs:', attrs);
    return n;
}

function name2weight(p) {
    p = path.basename(p)
    .replace(/BodoniIt/, 'Bodoni Italic');
    let re = /Thin|SemiBold|Semibold|DemiBold|Demi-Bold|Regular|Demi|Medium|Extra-Light|ExtraLight|UltraLight|Light|ExtraBold|Extra-Bold|Bold|-bold|Black|Heavy|BdIta/;
    let m = re.exec(p);
    let w = (m ? m[0] : "regular").toLowerCase();
    //console.log("name2weight", p, "-->", "-->", w);
    switch (w) {
    case "thin":
        return 100;
    case "extra-light":
    case "ultralight":
    case "extralight":
        return 200;
    case "light":
        return 300;
    case "regular":
        return 400;
    case "demi":
    case "medium":
        return 500;
    case "demi-bold":
    case "demibold":
    case "semibold":
        return 600;
    case "-bold":
    case "bold":
    case "bdita":
        return 700;
    case "extra-bold":
    case "extrabold":
        return 800;
    case "heavy":
    case "black":
        return 900;
    default:
        return 500;
    }
}


const glob_cfg = {
  // only want the files, not the dirs
  nodir: true,
  ignore: {
    ignored: p => p.isNamed('glyphs') || p.isNamed('fonts-tests') || p.isNamed('older sources') || p.isNamed('legacy') || p.isNamed('old') || p.isNamed('_temp') || p.isNamed('proofs') || p.isNamed('res') || p.isNamed('3D') || p.isNamed('test') || p.isNamed('webfonts') || p.isNamed('development') || p.isNamed('calsans-static-geo') || p.isNamed('calsans-static-ui') || p.isNamed('calsans-gf-api-static') || p.isNamed('calsans-gf-workspace') || p.isNamed('calsans-static-base') || p.isNamed('calsans-static-essentials') || p.isNamed('calsans-static-a11y') || p.isNamed('calsans-cossui') || p.isNamed('calsans-adobe-vf') || p.isNamed('family_planning'),
    childrenIgnored: p => p.isNamed('glyphs') || p.isNamed('fonts-tests') || p.isNamed('older sources') || p.isNamed('legacy') || p.isNamed('old') || p.isNamed('_temp') || p.isNamed('proofs') || p.isNamed('res') || p.isNamed('3D') || p.isNamed('test') || p.isNamed('webfonts') || p.isNamed('development') || p.isNamed('calsans-static-geo') || p.isNamed('calsans-static-ui') || p.isNamed('calsans-gf-api-static') || p.isNamed('calsans-gf-workspace') || p.isNamed('calsans-static-base') || p.isNamed('calsans-static-essentials') || p.isNamed('calsans-static-a11y') || p.isNamed('calsans-cossui') || p.isNamed('calsans-adobe-vf') || p.isNamed('family_planning'),
  },
};

let scsslist = g.sync(cleanup4glob(rootdir + "*.scss"), glob_cfg);
//console.log({scsslist});
if (scsslist.length >= 1) {
    console.log("We already have at least one SCSS definition file for this font:", rootdir);
    process.exit(0);
}
let flist = g.sync([ rootdir + "/**/*.ttf", rootdir + "/**/*.otf" ], glob_cfg);
//console.log({flist});
if (flist.length == 0) {
    console.log("Not a font directory... SKIPPING.");
    process.exit(1);
}

let app_rv = 1;
let processed_fontnames = {};

// see if we have variable font in there...
let variable_list = [];
let rest_list = [];
for (let i = 0; i < flist.length; i++) {
    let fontpath = flist[i]
        .replace(/\\/g, '/');
    let is_variable = /VF|variable|[\[\]]/i.test(fontpath);
    if (is_variable) {
        variable_list.push(fontpath);
    }
	else {
        rest_list.push(fontpath);
	}
}
flist = rest_list;

if (variable_list.length > 0) {
    let scssfile = cleanup_for_SCSS_filename(rootdir, " Variable.scss");

    let src = `

    /*
    VARIABLE
    */

    `;

    for (let i = 0; i < variable_list.length; i++) {
        let ttf_path = variable_list[i];
        fontname = cleanup4fontname(ttf_path)
		.replace(/ VF/, '');
		
		//processed_fontnames[fontname] = 'V';
		
        let is_italic = /italic|bdita|BodoniIt/i.test(path.basename(ttf_path));
        let is_oblique = /oblique|,slnt,/i.test(path.basename(ttf_path));
        let has_flar = /FLAR[,\]]/i.test(path.basename(ttf_path));
        let has_volm = /VOLM[,\]]/i.test(path.basename(ttf_path));
        let has_opsz = /opsz[,\]]/i.test(path.basename(ttf_path));
        let has_wdth = /wdth[,\]]/i.test(path.basename(ttf_path));
        let has_ital = /ital[,\]]/i.test(path.basename(ttf_path));
        let has_slnt = /slnt[,\]]/i.test(path.basename(ttf_path));

        src += `

@font-face {
    font-family: '${fontname} VF';
    src: url('${ttf_path}') format('truetype-variations');
    /* font-weight requires a range: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fonts/Variable_Fonts_Guide#Using_a_variable_font_font-face_changes */
    font-weight: 100 950;
    font-stretch: 75% 125%;
    font-style: ${ is_italic ? "italic" : is_oblique ? "oblique" : "normal" };
    ${ has_flar ? "font-variation-settings: 'FLAR' var(--text-flar);" : "" }
    ${ has_volm ? "font-variation-settings: 'VOLM' var(--text-volm);" : "" }
    ${ has_opsz ? "font-variation-settings: 'OPSZ' var(--text-opsz);" : "" }
    ${ has_wdth ? "font-variation-settings: 'WDTH' var(--text-wdth);" : "" }
    ${ has_ital ? "font-variation-settings: 'ITAL' var(--text-ital);" : "" }
    ${ has_slnt ? "font-variation-settings: 'SLNT' var(--text-slnt);" : "" }
    font-feature-settings: "liga" on, "kern" on;
    font-display: auto;
}

        `;
    }

    //console.log({scssfile, fontname, variable_list, src});

    fs.writeFileSync(scssfile, src, "utf8");

	app_rv = 0;
}

// see if we have OTF in there...
let opentype_list = [];
rest_list = [];
for (let i = 0; i < flist.length; i++) {
    let fontpath = flist[i]
        .replace(/\\/g, '/');
    if (/[.]otf$/.test(fontpath)) {
        opentype_list.push(fontpath);
    }
	else {
        rest_list.push(fontpath);
	}
}
flist = rest_list;

if (opentype_list.length > 0) {
    let scssfile = cleanup_for_SCSS_filename(rootdir, " OpenType.scss");

    let src = `

    /*
    OTF
    */

    `;

    for (let i = 0; i < opentype_list.length; i++) {
        let ttf_path = opentype_list[i];
        fontname = cleanup4fontname(ttf_path);
		
		processed_fontnames[fontname] = 'O';
        
		let is_italic = /italic|bdita|BodoniIt/i.test(path.basename(ttf_path));
        let is_oblique = /oblique|,slnt,/i.test(path.basename(ttf_path));
        let font_weight = name2weight(ttf_path);

        src += `

@font-face {
    font-family: '${fontname}';
    src: url('${ttf_path}') format('opentype');
    font-weight: ${ font_weight };
    font-style: ${ is_italic ? "italic" : is_oblique ? "oblique" : "normal" };
    font-feature-settings: "liga" on, "kern" on;
    font-display: auto;
}

        `;
    }

    //console.log({scssfile, fontname, opentype_list, src});

    fs.writeFileSync(scssfile, src, "utf8");

	app_rv = 0;
}


// otherwise collect the TTF files...
let ttf_list = [];
for (let i = 0; i < flist.length; i++) {
    let fontpath = flist[i]
        .replace(/\\/g, '/');
    if (/[.]ttf$/.test(fontpath)) {
        ttf_list.push(fontpath);
    }
}

if (ttf_list.length > 0) {
    let scssfile = cleanup_for_SCSS_filename(rootdir, ".scss");

    let src = `

    /*
    TTF
    */

    `;
	let added_anything = false;

    for (let i = 0; i < ttf_list.length; i++) {
        let ttf_path = ttf_list[i];
        fontname = cleanup4fontname(ttf_path);

		if (processed_fontnames[fontname] === 'O')
			continue;
		else
			processed_fontnames[fontname] = 'T';

        let is_italic = /italic|bdita|BodoniIt/i.test(path.basename(ttf_path));
        let is_oblique = /oblique|,slnt,/i.test(path.basename(ttf_path));
        let font_weight = name2weight(ttf_path);

		added_anything = true;
        src += `

@font-face {
    font-family: '${fontname}';
    src: url('${ttf_path}') format('truetype');
    font-weight: ${ font_weight };
    font-style: ${ is_italic ? "italic" : is_oblique ? "oblique" : "normal" };
    font-feature-settings: "liga" on, "kern" on;
    font-display: auto;
}

        `;
    }

	if (added_anything) {
		//console.log({scssfile, fontname, ttf_list, src});

		fs.writeFileSync(scssfile, src, "utf8");

		app_rv = 0;
	}
}

if (app_rv != 0)
	console.log("Failed to produce a SCSS file for font:", rootdir);
process.exit(app_rv);



