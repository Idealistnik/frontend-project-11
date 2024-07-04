// Generated using webpack-cli https://github.com/webpack/webpack-cli
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';
import process from 'node:process';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entry: path.resolve(dirname, './src/index.js'),
  output: {
    filename: '[name][contenthash].js',
    path: path.resolve(dirname, 'dist'),
    clean: true,
  },
  devServer: {
    open: true,
    port: 5000,
    watchFiles: ['./index.html', './src/**/*'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(dirname, './index.html'),
    }),

    new MiniCssExtractPlugin({
      filename: '[name][contenthash].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

export default () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
