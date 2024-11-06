const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './background.js',
  output: {
    filename: 'background.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './node_modules/@tensorflow/tfjs-backend-wasm/dist/*.wasm',
          to: '[name][ext]',
        },
      ],
    }),
  ],
  experiments: {
    asyncWebAssembly: true
  }
}; 