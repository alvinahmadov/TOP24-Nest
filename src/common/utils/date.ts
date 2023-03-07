import { IModel, TUpdateAttribute } from '@common/interfaces';

/**
 * Formats date form to YYYY-MM-DD.
 *
 * @example
 * 22-05-2022 => 2022-22-05
 * */
export function formatDateString(date: Date | string | number, sep: string = '-'): Date {
	let fmtDateString = date;
	let dateChunks: string[] = [];
	if(typeof date === 'string') {
		dateChunks = date.split(sep);
		let day, month, year;

		if(dateChunks.length == 3 && dateChunks[2].length == 4) {
			if(Number(dateChunks[1]) > 12) {
				day = dateChunks[1];
				month = dateChunks[0];
				year = dateChunks[2];
			}
			else {
				day = dateChunks[0];
				month = dateChunks[1];
				year = dateChunks[2];
			}
			fmtDateString = `${year}-${month}-${day}`;
		}
		else {
			fmtDateString = date;
		}
		return new Date(fmtDateString);
	}
	if(typeof date === 'number')
		return new Date(date);
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
	...keys: K[]
): void {
	for(const key of keys) {
		if(key in data) {
			// @ts-ignore
			data[key] = formatDateString(data[key].toString());
		}
	}
}

export function toLocaleDateTime(
	dateOrString: Date | string,
	mode: 'mixed' | 'date' | 'time' = 'mixed'
): string {
	const date = typeof dateOrString === 'string' ? new Date(dateOrString)
	                                              : dateOrString;
	const locale = 'ru';
	switch(mode) {
		case "time":
			return date?.toLocaleTimeString(locale);
		case "date":
			return date?.toLocaleDateString(locale);
		case "mixed":
		default:
			return date?.toLocaleString(locale);
	}
}

export function setMonthSuffixRussianLocale(month: string): string {
	const lastIndex = month.length - 1;
	return month[lastIndex] === 'ь' || month[lastIndex] === 'й' ? month.substring(0, lastIndex) + 'я'
	                                                            : month + 'а';
}
