var webpack = require('webpack')

module.exports = {
  output: {
    filename: "bundle.js"
  },
  plugins: [ //Optimize all posible code with this stuff
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress:{
        warnings: false //Remove warnings, production oriented
      }
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|fr|hu/)
  ],
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel', // 'babel-loader' is also a valid name to reference
        query: {
          presets: ["es2015","babel-preset-es2015"]
        }
      }
    ]
  }
}
