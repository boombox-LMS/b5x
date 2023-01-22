import * as fs from 'fs';

export function listTopicFolders(dir: string) {
	let results: string[] = [];
	const list = fs.readdirSync(dir);
	list.forEach(function(file) {
			file = dir + '/' + file;
			const stat = fs.statSync(file);
			if (stat && stat.isDirectory()) { 
				results = results.concat(listTopicFolders(file));
			} else { 
				let fileName = file.split(/(\\|\/)/g).pop();
				if (fileName === 'topic-config.yaml') {
					results.push(dir)
				}
			}
	});
	return [...new Set(results)];
}