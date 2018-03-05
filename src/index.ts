import maps from '@google/maps';

import { Point } from './util';
import { getDistanceMatrix } from './get-dm';

const originLatitude = 40.7490185;
const originLongitude = -73.9863929;

const origin = [originLatitude, originLongitude] as Point;

const latitudeSampleCount = 50;
const latitudeSampleRange = 0.15;

const longitudeSampleCount = 50;
const longitudeSampleRange = 0.125;

const provisionHandler = () => Promise.resolve({
	client: maps.createClient({
		key: process.env['GOOGLE_API_KEY']!,
	}),
});

export const handler = (event: any, context: any, callback: (err?: Error, messsage?: any) => never) => {
	provisionHandler().then(({ client }) =>
		getDistanceMatrix(client, {
			origin,
			latitudeSampleCount,
			latitudeSampleRange,
			longitudeSampleCount,
			longitudeSampleRange,
		})
	).then(results => {
		const finalOutput = {
			origin: { lat: origin[0], lng: origin[1] },
			latitudeSampleCount,
			latitudeSampleRange,
			longitudeSampleCount,
			longitudeSampleRange,
			results,
		};
	    callback(undefined, `Wrote ${results.length} for query ending ${new Date()}`);
	}).catch(err => {
		callback(err);
	});
};
