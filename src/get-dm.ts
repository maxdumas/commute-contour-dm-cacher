import _ from 'lodash';

import { Point } from './util';

const getUniformSamples = (center: number, r: number, n: number) => {
	const start = center - (r / 2);
	return _.range(n).map(i => start + (i / n) * r);
};

const f = (a: any[], b: any[]) => _.flatten(a.map(d => b.map(e => [d, e])));
export function cartesian(a: any[], b?: any[], ...c: any[][]): any[][] { return (b ? cartesian(f(a, b), ...c) : a); }

interface DistanceMatrixOptions {
	origin: Point,
	latitudeSampleCount: number,
	latitudeSampleRange: number,
	longitudeSampleCount: number,
	longitudeSampleRange: number,
}

export const getDistanceMatrix = (client: any, options: DistanceMatrixOptions) => {
	const {
		origin,
		latitudeSampleCount,
		latitudeSampleRange,
		longitudeSampleCount,
		longitudeSampleRange,
	} = options;

	const [originLatitude, originLongitude] = origin;

	const destinationLatitudes = getUniformSamples(originLatitude, latitudeSampleRange, latitudeSampleCount);
	const destinationLongitudes = getUniformSamples(originLongitude, longitudeSampleRange, longitudeSampleCount);
	const destinations: Point[] = <Point[]>cartesian(destinationLatitudes, destinationLongitudes);

	// Most allowed destinations in a single request is 100
	const destinationChunks = _.chunk(destinations, 100);

	const generateTravelDurations = (destinations: Point[]) => new Promise((resolve, reject) =>
		client.distanceMatrix({
			origins: [origin],
			destinations,
			mode: 'transit',
		}, (err?: Error, response?: any) => {
			if (err || response.status !== 200) {
				reject(err);
			} else {
				// Expecting one row, with an elements field with two entries
				const distanceDurations = response.json.rows[0].elements;
				const results = _.zip(destinations, distanceDurations).map(([destination, result]) => ({
					location: {
						lat: destination![0],
						lng: destination![1],
					},
					...result,
				}));
				resolve(results);
			}
		})
	);

	return Promise.all(destinationChunks
		.map(generateTravelDurations))
		.then(_.flatten);
};


