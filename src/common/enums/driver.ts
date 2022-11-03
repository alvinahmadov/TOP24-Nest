import { getTranslation } from '@common/utils';

/**
 * Status of driver for order fulfillment
 * */
export enum DriverStatus {
	/**
	 * Driver is not ready or not willing to fulfill the order
	 * */
	NONE = 0,
	/**
	 * Driver is on way to destination point.
	 * */
	ON_WAY = 1,
	/**
	 * Driver has arrived to destination point.
	 * */
	ON_POINT = 2,
	/**
	 * Driver uploads document.
	 * */
	DOC_LOAD = 3
}

/**@ignore*/
export const driverStatusToStr = (status: DriverStatus) =>
	getTranslation('ENUM', 'DRIVER', 'STATUS', DriverStatus[status]);
