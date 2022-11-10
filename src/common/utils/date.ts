import { IModel, TUpdateAttribute } from '@common/interfaces';

/**
 * Formats date from form of DD-MM-YYYY to YYYY-MM-DD
 *
 * @example
 * 22-05-2022 => 2022-05-22
 * */
export function formatDateString(date: Date | string, sep: string = '-'): Date {
	let fmtDateString = date;
	let dateChunks: string[] = [];
	if(typeof (date) === 'string') {
		dateChunks = date.split(sep);
		if(dateChunks.length == 3 && dateChunks[2].length == 4) {
			fmtDateString = `${dateChunks[2]}-${dateChunks[1]}-${dateChunks[0]}`;
		} else {
			fmtDateString = date;
		}
		return new Date(fmtDateString);
	}
	return date;
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

export function reformatDateString<T extends IModel, K = keyof T>(
	data: TUpdateAttribute<T>,
	keys: K[]
) {
	for(const key of keys) {
		if(key in data) {
			// @ts-ignore
			data[key] = formatDateString(data[key].toString());
		}
	}
}
