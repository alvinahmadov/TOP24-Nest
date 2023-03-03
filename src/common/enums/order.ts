import { getTranslation } from '@common/utils';

/**
 * Status of the cargo order carry
 * */
export enum OrderStatus {
	/**
	 * @enum OrderStatus
	 * 
	 * @summary Order is pending on completion.
	 * */
	PENDING = 0,
	/**
	 * @summary Order completion is accepted by driver.
	 * @enum OrderStatus
	 * */
	ACCEPTED = 1,
	/**
	 * @summary Order is on processing/payment.
	 * @enum OrderStatus
	 * */
	PROCESSING = 2,
	/**
	 * @summary Driver cancelled offer/order.
	 * @enum OrderStatus
	 * */
	CANCELLED = 3,
	/**
	 * @summary Order finished.
	 * @enum OrderStatus
	 * */
	FINISHED = 4,
	/**
	 * @summary Cargo owner cancelled order.
	 * @enum OrderStatus
	 * */
	CANCELLED_BITRIX = 5,
}

/**
 * Stage of the order implementation
 * */
export enum OrderStage {
	/**
	 * @summary Order has expired.
	 * */
	LOSE = -1,
	/**
	 * @summary The order is created recently.
	 * */
	NEW = 0,
	/**
	 * @summary Order is in preparation stage.
	 * */
	PREPARATION = 1,
	/**
	 * @summary Price has been agreed with the Logist
	 * */
	AGREED_LOGIST = 2,
	/**
	 * @summary Price has been agreed with the cargo owner.
	 * */
	AGREED_OWNER = 3,
	/**
	 * @summary The application with the driver has been signed.
	 * */
	SIGNED_DRIVER = 4,
	/**
	 * @summary The application with the cargo owner has been signed.
	 * */
	SIGNED_OWNER = 5,
	/**
	 * @summary Transportation agreed (Carried out).
	 * */
	CARRYING = 6,
	/**
	 * @summary Problem with transportation.
	 * */
	HAS_PROBLEM = 7,
	/**
	 * @summary Transportation continues.
	 * */
	CONTINUE = 8,
	/**
	 * The cargo has been delivered (documents are in verification).
	 * */
	DELIVERED = 9,
	/**
	 * The documents have been sent.
	 * */
	DOCUMENT_SENT = 10,
	/**
	 * The payment account has been formed.
	 * */
	PAYMENT_FORMED = 11,
	/**
	 * Payment received.
	 * */
	PAYMENT_RECEIVED = 12,
	/**
	 * The deal is succeeded.
	 * */
	FINISHED = 13
}

export enum ActionStatus {
	/**
	 * Default value
	 * */
	NONE = 0,
	/**
	 * Driver is on way to destination point.
	 * */
	ON_WAY = 1,
	/**
	 * Driver has arrived to destination point.
	 * */
	ARRIVED = 2,
	/**
	 * Driver uploads document.
	 * */
	DOCUMENT_UPLOAD = 3
}

/**
 * Type of destination point for order.
 * */
export enum DestinationType {
	/**
	 * Loading point
	 * */
	LOAD = 0,
	/**
	 * Unloading point
	 * */
	UNLOAD = 1,
	/**
	 * Loading/Unloading point
	 * */
	COMBINED = 2
}

/**@ignore*/
export const orderStatusToStr = (status: OrderStatus) =>
	getTranslation('ENUM', 'ORDER', 'STATUS', OrderStatus[status]);

/**@ignore*/
export const orderStageToStr = (stage: OrderStage) =>
	getTranslation('ENUM', 'ORDER', 'STAGE', OrderStage[stage]);

/**@ignore*/
export const destinationTypeToStr = (type: DestinationType) =>
	getTranslation('ENUM', 'ORDER', 'DESTINATION', DestinationType[type]);
