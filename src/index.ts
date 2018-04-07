import AWS from 'aws-sdk';
import maps from '@google/maps';
import uid from 'uid-safe';
AWS.config.update({ region: 'us-east-1' });

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

export const handler = async (event: any, context: any, callback: (err?: Error, messsage?: any) => never) => {
	try {
		const dynamodb = new AWS.DynamoDB();

		const client = await provisionHandler();
		const results = await getDistanceMatrix(client, {
			origin,
			latitudeSampleCount,
			latitudeSampleRange,
			longitudeSampleCount,
			longitudeSampleRange,
		});

		const dbParams = {
			Item: {
				id: { S: `${origin[0]}_${origin[1]}` },
				originLatitude: { N: '' + origin[0] },
				originLongitude: { N: '' + origin[1] },
				latitudeSampleCount: { N: '' + latitudeSampleCount },
				latitudeSampleRange: { N: '' + latitudeSampleRange },
				longitudeSampleCount: { N: '' + longitudeSampleCount },
				longitudeSampleRange: { N: '' + longitudeSampleRange },
				results: { S: JSON.stringify(results) },
				queryDate: { N: '' + Date.now() },
			},
			ReturnConsumedCapacity: 'TOTAL',
			TableName: 'DMCache',
		};

		const response: AWS.DynamoDB.PutItemOutput = await new Promise((resolve, reject) => {
			dynamodb.putItem(dbParams, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
		const writeCount = response!.ConsumedCapacity!.CapacityUnits;
	    callback(undefined, `Wrote ${writeCount} for query ending ${new Date()}`);
	} catch (err) {
		callback(err);
	}
};
