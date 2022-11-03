import { getTranslation } from '@common/utils';

export enum OfferStatus {
	NONE = 0,
	SENT = 1,
	SEEN = 2,
	RESPONDED = 3,
	DECLINED = 4,
	NO_MATCH = 5
}

/**@ignore*/
export const offerStatusToStr = (status: OfferStatus) =>
	getTranslation('ENUM', 'OFFER', 'STATUS', OfferStatus[status]);
