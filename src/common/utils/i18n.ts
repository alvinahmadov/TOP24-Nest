import fs                  from 'fs';
import { join }            from 'path';
import env                 from '@config/env';
import { TLanguageConfig } from '@common/interfaces';

/**@ignore*/
const configPath = '../../../../../src/config/i18n/lang';

export let langConfig: TLanguageConfig;

function readLangConfigs(langFilePath: string)
	: TLanguageConfig {
	if(!langConfig)
		langConfig = {};
	else
		return langConfig;

	let dirContent = fs.readdirSync(langFilePath, { encoding: 'utf-8', withFileTypes: true });
	const ext = 'json';

	for(const conf of dirContent) {
		if(conf.isFile() && conf.name.endsWith(ext)) {
			const langFile = fs.readFileSync(`${langFilePath}/${conf.name}`, { encoding: 'utf-8' });
			const [start, length] = [0, conf.name.length - `.${ext}`.length];
			let langCode = conf.name.substring(start, length);
			langConfig[langCode] = JSON.parse(langFile);
		}
	}
	return langConfig;
}

export function getTranslation(...keys: string[]) {
	let config = readLangConfigs(join(__dirname + configPath))[env.app.lang ?? 'ru'];

	keys?.forEach(
		(key) =>
		{
			if(config[key] !== undefined) {
				config = config[key];
			}
		}
	);

	return config;
}

export function formatArgs(str: string, ...args: any[]) {
	if(!args || args.length === 0) {
		while(str.search('{}') >= 0) {
			str = str.replace('{}', '');
		}

		return str;
	}

	for(const arg of args) {
		let index = str.indexOf('{');
		if(
			++index < str.length &&
			str[index] === '}'
		) {
			str = str.replace('{}', String(arg));
		}
	}
	return str;
}
