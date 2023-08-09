import { getTranslation } from '@common/utils';

export enum TransportStatus {
	/**
	 * Transport is not active but ready to work.
	 * */
	NONE = 0,
	/**
	 * Transport is selected by driver and
	 * is currently used for order fullfilment.
	 * */
	ACTIVE = 1,
	/**
	 * Transport can not be used because
	 * of technical or other problems.
	 * */
	HAS_PROBLEM = 2
}

/**
 * Position of the payload in transport
 * */
export enum LoadingType {
	/**
	 * For any type is unknown.
	 * */
	NONE = 0,
	/**
	 * Payload on back side of transport.
	 * */
	BACK = 1,
	/**
	 * Payload on top side of transport.
	 * */
	TOP = 2,
	/**
	 * Payload on side of transport.
	 * */
	SIDE = 3
}

/**@ignore*/
export const transportStatusToStr = (status: TransportStatus) =>
	getTranslation('ENUM', 'TRANSPORT', 'STATUS', TransportStatus[status]);

/**@ignore*/
export const loadingTypeToStr = (status: LoadingType) =>
	getTranslation('ENUM', 'TRANSPORT', 'LOADTYPE', LoadingType[status]);
