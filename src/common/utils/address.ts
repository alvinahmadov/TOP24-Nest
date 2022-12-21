import { AxiosRequestConfig } from 'axios';
import env                    from '@config/env';
import {
	EARTH_RADIUS,
	HALF_RADIAN,
	Reference
}                             from '@common/constants';
import {
	AxiosStatic,
	ApiQuery
}                             from '@common/classes';
import {
	IAddress,
	IKladrResponse, IListFilter,
	IOSMData,
	TGeoCoordinate
}                             from '@common/interfaces';

const degreesToRadians = (degrees: number): number => degrees * Math.PI / HALF_RADIAN;

export async function addressFromCoordinates(
	latitude: number,
	longitude: number
): Promise<string> {
	const url = `${env.osm.url}/reverse?lat=${latitude}&lon=${longitude}&format=json`;
	const config: AxiosRequestConfig = { headers: { 'Accept-Language': 'ru-RU' } };

	const { address } = await AxiosStatic.get<IOSMData>(url, config);

	return [
		address?.road,
		address?.town,
		address?.county,
		address?.state,
		address?.region,
		address?.country,
		address?.postcode
	].filter(a => !!a)
	 .join(',');
}

export function calculateDistance(
	startPoint: TGeoCoordinate,
	endPoint: TGeoCoordinate
): number {
	if(!startPoint || !endPoint)
		return null;

	const dLat = degreesToRadians(endPoint[0] - startPoint[0]),
		dLng = degreesToRadians(endPoint[1] - startPoint[1]);

	const lat1 = degreesToRadians(startPoint[0]),
		lat2 = degreesToRadians(endPoint[0]);

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	          Math.sin(dLng / 2) * Math.sin(dLng / 2) *
	          Math.cos(lat1) * Math.cos(lat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const result = EARTH_RADIUS * c;

	if(!result || Number.isNaN(result))
		return 0;

	return result;
}

export function splitAddress(address: string): {
	address: string;
	coordinates?: TGeoCoordinate;
} {
	if(address) {
		const addressParts: string[] = address.split('|');

		if(addressParts.length == 1) {
			return { address: addressParts[0], coordinates: null };
		}
		else if(addressParts.length > 1) {
			const [lat, lng] = addressParts[1].split(/[;,]/);
			return {
				address:     addressParts[0],
				coordinates: [Number(lat), Number(lng)]
			};
		}
	}

	return { address: '', coordinates: null };
}

export async function searchAddressByKladr(
	query: string,
	listFilter?: IListFilter
): Promise<IAddress[]> {
	const addresses: Array<IAddress> = [];
	const qBuilder = new ApiQuery(Reference.KLADR_API_URL);
	const { from: offset, count: limit } = listFilter ?? {};

	qBuilder.addQuery('query', query)
	        .addQuery('withParent', 1)
	        .addQuery('oneString', 1)
	        .addQuery('limit', limit)
	        .addQuery('offset', offset);

	const data = await AxiosStatic.get<IKladrResponse>(qBuilder.query);

	for(const datum of data.result) {
		let address: IAddress = {
			id:        datum.guid,
			createdAt: new Date(),
			updatedAt: new Date(),
			value:     `Россия, ${datum.fullName}`,
			country:   'Россия'
		};

		for(const parent of datum.parents) {
			let addedZip: boolean = false;
			switch(parent.contentType) {
				case 'city':
					if(parent.typeShort === 'г') {
						address['city'] = parent.name;
						address['cityType'] = parent.typeShort;
					}
					else {
						address['settlement'] = parent.name;
						address['settlementType'] = parent.typeShort;
					}

					if(parent.zip && !addedZip) {
						address.value += ', ' + parent.zip;
						addedZip = true;
					}
					break;
				case 'region':
					address['region'] = parent.name;
					address['regionType'] = parent.typeShort;
					break;
				case 'district':
					address['area'] = parent.name;
					address['areaType'] = parent.typeShort;
					break;
				case 'street':
					address['street'] = parent.name;
					if(parent.zip && !addedZip) {
						address.value += ', ' + parent.zip;
						addedZip = true;
					}
					break;
			}
		}

		addresses.push(address);
	}

	return addresses;
}

export async function searchAddressByOSM(
	query: string,
	listFilter?: IListFilter
) {
	const addresses: Array<Partial<IAddress>> = [];
	const qBuilder = new ApiQuery(Reference.OSM_API_URL);
	const { count: limit } = listFilter ?? {};

	qBuilder.addQuery('q', query)
	        .addQuery('limit', limit)
	        .addQuery('addressdetails', 1)
	        .addQuery('format', 'jsonv2')
	        .addQuery('accept-language', 'ru')
	        .addQuery('countrycodes', 'ru');

	const osmData = await AxiosStatic.get<IOSMData[]>(qBuilder.query);

	for(const osm of osmData) {
		addresses.push({ value: osm.display_name });
	}

	return addresses;
}
