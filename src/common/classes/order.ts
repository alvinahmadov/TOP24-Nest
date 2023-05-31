import { InterfaceType } from '@nestjs/graphql';
import {
	IOrderExecutionState,
	IOrderFilter
}                        from '@common/interfaces';
import {
	ActionStatus,
	DestinationType,
	LoadingType,
	OrderStatus
}                        from '@common/enums';

@InterfaceType()
export class OrderExecutionState
	implements IOrderExecutionState {
	type?: DestinationType;

	actionStatus?: ActionStatus;
	loaded?: boolean;
	unloaded?: boolean;
	uploaded?: boolean;

	static set(lhs: IOrderExecutionState, state: IOrderExecutionState): void {
		try {
			if(lhs.loaded === undefined)
				lhs.loaded = !!state?.loaded;
			if(lhs.unloaded === undefined)
				lhs.unloaded = !!state?.unloaded;
			if(lhs.uploaded === undefined)
				lhs.uploaded = !!state?.uploaded;
		} catch(e) {}
	};
}

@InterfaceType()
export class OrderFilter
	implements IOrderFilter {
	/**
	 * Minimal weight limit for order.
	 * */
	weightMin?: number;
	/**
	 * Maximal weight limit for order.
	 * */
	weightMax?: number;
	/**
	 * Minimal volume limit for order.
	 * */
	volumeMin?: number;
	/**
	 * Maximal volume limit for order.
	 * */
	volumeMax?: number;
	/**
	 * Minimal length limit for order.
	 * */
	lengthMin?: number;
	/**
	 * Maximal length limit for order.
	 * */
	lengthMax?: number;
	/**
	 * Minimal width limit for order.
	 * */
	widthMin?: number;
	/**
	 * Maximal width limit for order.
	 * */
	widthMax?: number;
	/**
	 * Minimal width limit for order.
	 * */
	heightMin?: number;
	/**
	 * Maximal height limit for order.
	 * */
	heightMax?: number;
	/**
	 * Types of transport for order.
	 * */
	types?: string[];
	/**
	 * Number of pallets of transport for order.
	 * */
	pallets?: number;
	/**
	 * For dedicated transports only.
	 * */
	isDedicated?: boolean;
	/**
	 * Capability for taking extra payload.
	 * */
	payloadExtra?: boolean;
	/**
	 * Payload filter.
	 * */
	payload?: string;
	payloadType?: string;
	loadingTypes?: LoadingType[];
	status?: OrderStatus;
	riskClass?: string;
	paymentTypes?: string[];
	dedicated?: string;
	directions?: string[];
	hasDriver?: boolean;
	fromDate?: Date | string;
	toDate?: Date | string;
}
