import { Position } from 'geojson';
import * as ors     from '@routingjs/ors';
import {
	Direction,
	Directions
}                   from '@routingjs/core';
import env          from '@config/env';

const { apiKey } = env.ors;

type TDrivingCarFeatures = "highways" | "ferries" | "tollways";

type TAvoidFeaturesOption = Array<TDrivingCarFeatures>;

type TAvoidBordersOption = "all" | "controlled" | "none";

interface IORSRouteOptions {
	/**
	 * all for no border crossing. controlled to cross
	 * open borders but avoid controlled ones.
	 * Only for driving-* profiles.
	 * */
	avoid_borders?: TAvoidBordersOption;
	/**
	 * List of features to avoid.
	 * */
	avoid_features?: TAvoidFeaturesOption;
	/**
	 * List of countries to exclude from matrix with driving-* profiles.
	 * Can be used together with 'avoid_borders': 'controlled'.
	 * [ 11, 193 ] would exclude Austria and Switzerland.
	 * List of countries and application examples can be found here.
	 * Also, ISO standard country codes cna be used in place of
	 * the numerical ids, for example, DE or DEU for Germany.
	 * */
	avoid_countries?: number[];
}

type TORSDirectionsOpts = (Omit<ors.ORSDirectionsOpts, 'options'> & { options?: IORSRouteOptions })

export class OpenRouteService {

	private orsClient: ors.ORS;
	private orsDirection: Direction<ors.ORSRoute>;
	private orsPositions: Position[];

	constructor() {
		this.orsClient = new ors.ORS({ apiKey });
	}

	public async fetch(
		coordinates: [number, number][],
		options?: TORSDirectionsOpts,
		profile: ors.ORSProfile = "driving-car"
	): Promise<OpenRouteService> {
		let response: Directions<ors.ORSRouteResponse, ors.ORSRoute>;

		try {
			response = await this.orsClient.directions(coordinates, profile, options, false, 'geojson');
		} catch(e) {
			const error: ors.ORSAPIError = e;
			console.error(error.properties);
		}
		if(response?.directions) {
			if(response.directions.length) {
				this.orsDirection = response.directions.at(0);
				this.orsPositions = this.direction.feature.geometry.coordinates.map(c => [c[1], c[0]]);
			}
		}

		return this;
	}

	public get direction() {
		return this.orsDirection;
	}

	public get positions(): Position[] {
		if(this.direction) {
			return this.orsPositions;
		}
		return [];
	}
}
