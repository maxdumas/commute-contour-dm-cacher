declare module '@google/maps' {
	interface DistanceMatrixOptions {

	}

    export interface Client {
    	distanceMatrix: (options: DistanceMatrixOptions) => ((err: Error, response: Response) => never);
    }

    export const createClient: ({ key }: { key: string }) => Client;

	export * from 'googlemaps';
}