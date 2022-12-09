import path                   from 'path';
import { v4 as uuid }         from 'uuid';
import * as ex                from 'express';
import env                    from '@config/env';
import {
	RANDOM_CODE_MAX,
	RANDOM_CODE_DIGITS
}                             from '@common/constants';
import {
	IApiResponse,
	TMulterFile
}                             from '@common/interfaces';
import { transformApiResult } from '@common/utils/compat';
import Driver                 from '@models/driver.entity';
import Transport              from '@models/transport.entity';

const phoneRegex = RegExp(/[\s+()]+/gi);

export const formatPhone = (phoneNumber?: string): string | undefined =>
	phoneNumber ? phoneNumber.replace(phoneRegex, '') : undefined;

export const getRandomCode = (
	digits: number = RANDOM_CODE_DIGITS,
	max: number = RANDOM_CODE_MAX
): string => Math.round(digits + (max * Math.random())).toString();

export const isNumber = (value: any): boolean => !isNaN(Number(value));

export const isSuccessResponse = <T>(response: IApiResponse<T>) =>
	response?.statusCode >= 200 && response?.statusCode < 400;

export const min = (a: number, b: number): number => a > b ? b : a;

export const randomOf = <T>(...args: T[]): T => args[Math.floor(Math.random() * args?.length)];

export function fileExt(file: { mimetype?: string }) {
	if(file.mimetype) {
		switch(file.mimetype) {
			case 'image/gif':
				return 'gif';
			case 'image/jpeg':
				return 'jpeg';
			case 'image/jpg':
				return 'jpg';
			case 'image/png':
				return 'png';
			case 'image/svg+xml':
				return 'svg';
			case 'image/webp':
				return 'webp';
		}
	}
	return 'jpeg';
}

export function renameMulterFile(file: TMulterFile, ...args: string[]): TMulterFile {
	const { originalname: name, ...rest } = file;
	const fileName = uuid();
	return {
		originalname: path.join(...args, `${fileName.toUpperCase()}.${fileExt({ mimetype: rest.mimetype })}`),
		...rest
	};
}

export function renameMulterFiles(files: TMulterFile[], ...args: string[]): TMulterFile[] {
	return files.map(f => renameMulterFile(f, ...args));
}

export function transformTransportParameters(transport: Transport): Transport {
	if(transport.weightExtra > 0) transport.weight = transport.weightExtra;
	if(transport.volumeExtra > 0) transport.volume = transport.volumeExtra;
	return transport;
}

export function transformDriverTransports(driver: Driver): Driver {
	if(driver.transports !== undefined)
		driver.transports = driver.transports.map(transformTransportParameters);

	return driver;
}

export function sendResponse<T = any>(
	response: ex.Response,
	result: IApiResponse<T>,
	transform: boolean = env.api.compatMode
) {
	return response.status(result?.statusCode ?? 400)
	               .send(
		               transform ? transformApiResult(result)
		                         : result
	               );
}
