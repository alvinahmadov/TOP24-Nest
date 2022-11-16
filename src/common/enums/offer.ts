import { getTranslation } from '@common/utils';

export enum OfferStatus {
	/**
	 * @summary None status, default.
	 * */
	NONE = 0,
	/**
	 * @summary The logistician sent the filtered drivers offers for the order.
	 * */
	SENT = 1,
	/**
	 * @summary The driver is notified about the offer of available order.
	 * */
	SEEN = 2,
	/**
	 * @summary The driver responded to the offer.
	 * */
	RESPONDED = 3,
	/**
	 * @summary Declined the offer before being selected by the logistician.
	 * */
	DECLINED = 4,
	/**
	 * @summary Refused the offer after being selected by the
	 * logistician, but before uploading the contract.
	 * */
	CANCELLED = 5,
	/**
	 * The driver does not meet the requirements of the order.
	 * */
	NO_MATCH = 6
}

/**@ignore*/
export const offerStatusToStr = (status: OfferStatus) =>
	getTranslation('ENUM', 'OFFER', 'STATUS', OfferStatus[status]);
