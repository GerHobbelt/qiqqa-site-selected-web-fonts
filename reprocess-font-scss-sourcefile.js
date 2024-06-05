
const path = require("path");
const fs = require("fs");
const g = require('glob');

//console.log({ argv: process.argv });

let scss_filepath = process.argv[2];

console.log("Processing SCSS file:", scss_filepath);

let src = fs.readFileSync(scss_filepath, "utf8");
let edited = false;

function cleanup4glob(p) {
	return p
	.replace(/[\[\],]/g, '?');
}

function cleanup_for_reconstruct(p) {
	return p
	.replace(/[\r\n\t]/g, ' ')
	.replace(/\\/g, '/');
}

src = src
.replace(/src: (local\([^)]+\).*?)?url\(([^)]+)\)([^;]+);/gm, function (m, p1, p2, p3) {
  if (!p1)
    p1 = "";
	let fp = p2.trim();
	if (/['"]/.test(fp[0]) && (fp[0] === fp[fp.length - 1])) {
		fp = fp.substring(1, fp.length - 1);
	}
	//console.log({p1, p2, p3, m, fp});
	
	if (!fs.existsSync(fp)) {
		console.log("Font file is missing:", fp);
		let rootdir = fp.replace(/\/.*$/, "");
		let fname = path.basename(fp);
		//console.log({rootdir, fname});
		
		let is_variable = /-variations/.test(p3);
		let variable_suffix = (is_variable ? '-variations' : '');

		const glob_cfg = {
		  // only want the files, not the dirs
          nodir: true,
		  ignore: {
			ignored: p => p.isNamed('glyphs') || p.isNamed('fonts-tests') || p.isNamed('older sources') || p.isNamed('legacy') || p.isNamed('old') || p.isNamed('_temp'),
			childrenIgnored: p => p.isNamed('glyphs') || p.isNamed('fonts-tests') || p.isNamed('older sources') || p.isNamed('legacy') || p.isNamed('old') || p.isNamed('_temp'),
		  },
		};
		
		let flist = g.sync(rootdir + "/**/" + cleanup4glob(fname), glob_cfg);
		//console.log({flist});
		if (flist.length >= 1) {
			let new_fpath = flist[0];
			//console.log({new_fpath});
			
			edited = true;
			
			return cleanup_for_reconstruct(`src: ${p1}url('${new_fpath}')${p3};`);
		}
		else {
			fname = path.basename(fp, path.extname(fname));
			console.log({rootdir, fname});
			
			flist = g.sync(rootdir + "/**/" + cleanup4glob(fname + ".otf"), glob_cfg);
			console.log({flist});
			if (flist.length >= 1) {
				let new_fpath = flist[0];
				console.log({new_fpath});
				
				edited = true;
				
				return cleanup_for_reconstruct(`src: ${p1}url('${new_fpath}') format('opentype${variable_suffix}');`);
			}
			
			flist = g.sync(rootdir + "/**/" + cleanup4glob(fname + ".ttf"), glob_cfg);
			console.log({flist});
			if (flist.length >= 1) {
				let new_fpath = flist[0];
				console.log({new_fpath});
				
				edited = true;
				
				return cleanup_for_reconstruct(`src: ${p1}url('${new_fpath}') format('truetype${variable_suffix}');`);
			}

			if (true) {
				edited = true;
			
				return `src: BAD FONT PATH SPEC! FILE IS LOST!`;
			}
		}
	}
	
	return cleanup_for_reconstruct(m);
});

if (edited) {
	fs.writeFileSync(scss_filepath, src, "utf8");
	console.log("Updated SCSS file:", scss_filepath);
}



