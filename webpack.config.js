const path = require('path');

module.exports = {
    mode: 'production',
    target: 'node',
    externals: ['aws-sdk'],
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'index.js',
        library: 'index',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.ts?$/, loader: 'ts-loader' }
        ]
    }
}
