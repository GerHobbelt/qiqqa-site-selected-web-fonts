
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

const glob_cfg = {
  // only want the files, not the dirs
  nodir: true,
  ignore: {
	ignored: p => p.isNamed('glyphs') || p.isNamed('fonts-tests') || p.isNamed('older sources') || p.isNamed('legacy') || p.isNamed('old') || p.isNamed('_temp') || p.isNamed('sources'),
	childrenIgnored: p => p.isNamed('glyphs') || p.isNamed('fonts-tests') || p.isNamed('older sources') || p.isNamed('legacy') || p.isNamed('old') || p.isNamed('_temp') || p.isNamed('sources'),
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

// see if we have variable font in there...
let variable_list = [];
for (let i = 0; i < flist.length; i++) {
	let fontpath = flist[i]
		.replace(/\\/g, '/');
	let is_variable = /VF|variable|[\[\]]/.test(fontpath);
	if (is_variable) {
		variable_list.push(fontpath);
	}
}

if (variable_list.length > 0) {
	let scssfile = rootdir + " Variable.scss";
	let fontname = path.basename(rootdir)
		.replace(/[\[].*$/g, '');
	
	let src = `
	
	/*
	${fontname}
	*/
	
	`;

	for (let i = 0; i < variable_list.length; i++) {
		let ttf_path = variable_list[i];
		fontname = path.basename(ttf_path)
			.replace(/[\[].*$/g, '');
		
		src += `

@font-face {
    font-family: '${fontname} VF';
    src: url('${ttf_path}') format('truetype-variations');
    font-weight: 100 950;
    font-stretch: 75% 125%;
    font-style: normal;
}

		`;
	}

	//console.log({scssfile, fontname, variable_list, src});
	
	fs.writeFileSync(scssfile, src, "utf8");
	
	process.exit(0);
}

// see if we have OTF in there...
let opentype_list = [];
for (let i = 0; i < flist.length; i++) {
	let fontpath = flist[i]
		.replace(/\\/g, '/');
	if (/[.]otf$/.test(fontpath)) {
		opentype_list.push(fontpath);
	}
}

if (opentype_list.length > 0) {
	let scssfile = rootdir + ".scss";
	let fontname = path.basename(rootdir);
	
	let src = `
	
	/*
	${fontname}
	*/
	
	`;

	for (let i = 0; i < opentype_list.length; i++) {
		let ttf_path = opentype_list[i];
		fontname = path.basename(ttf_path)
			.replace(/Thin|Thick|Regular|Medium|Light|ExtraBold|Bold|Extrathin|Extrathick|Black/ig, '')
			.replace(/-+$/, '')
			.replace(/-+/, '-');
		
		src += `

@font-face {
    font-family: '${fontname}';
    src: url('${ttf_path}') format('opentype');
    font-weight: 500;
    font-style: normal;
}

		`;
	}

	//console.log({scssfile, fontname, opentype_list, src});
	
	fs.writeFileSync(scssfile, src, "utf8");
	
	process.exit(0);
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
	let scssfile = rootdir + ".scss";
	let fontname = path.basename(rootdir);
	
	let src = `
	
	/*
	${fontname}
	*/
	
	`;

	for (let i = 0; i < ttf_list.length; i++) {
		let ttf_path = ttf_list[i];
		fontname = path.basename(ttf_path)
			.replace(/Thin|Thick|Regular|Medium|Light|ExtraBold|Bold|Extrathin|Extrathick|Black/ig, '')
			.replace(/-+$/, '')
			.replace(/-+/, '-');
		
		src += `

@font-face {
    font-family: '${fontname}';
    src: url('${ttf_path}') format('truetype');
    font-weight: 500;
    font-style: normal;
}

		`;
	}

	//console.log({scssfile, fontname, ttf_list, src});
	
	fs.writeFileSync(scssfile, src, "utf8");
	
	process.exit(0);
}

console.log("Failed to produce a SCSS file for font:", rootdir);
process.exit(1);



