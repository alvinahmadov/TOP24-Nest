import { IModel, TUpdateAttribute } from '@common/interfaces';

export function formatDateString(date: Date | string, sep: string = '-'): Date {
	let fmtDateString = date;
	let dateChunks: string[] = [];
	if(typeof (date) === 'string') {
		dateChunks = date.split(sep);
	}
	else if(date instanceof Date) {
		dateChunks = date.toISOString()
		                 .split('T')[0].split(sep);
	}
	if(dateChunks.length == 3 && dateChunks[2].length == 4) {
		fmtDateString = `${dateChunks[2]}-${dateChunks[1]}-${dateChunks[0]}`;
	}
	return new Date(fmtDateString);
}

export function dateValidator(dateString: string) {
	if(dateString === undefined)
		return null;
	const date = (dateString.search('.') > 0) ? formatDateString(dateString, '.')
	                                          : new Date(dateString);
	if(date + '' === 'Invalid Date')
		return null;
	return date;
}

export function reformatDateString<T extends IModel>(
	data: TUpdateAttribute<T>,
	keys: (keyof T)[]
) {
	for(const key of keys) {
		if(key in data) {
			// @ts-ignore
			data[key] = formatDateString(data[key].toString());
		}
	}
}
