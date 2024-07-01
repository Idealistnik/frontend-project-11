// Generated using webpack-cli https://github.com/webpack/webpack-cli
import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';// добавил
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';// добавил
import process from 'node:process'; // добавил

const __filename = fileURLToPath(import.meta.url);// добавил
const __dirname = path.dirname(__filename);// добавил

const isProduction = process.env.NODE_ENV === 'production'; // неправильно наверное сделал сверху импорт

// const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    filename: '[name][contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // должно удалять дист перед сборкой - кажется не удаляет
  },
  devServer: {
    open: true,
    // host: 'localhost',
    port: 5000,
    watchFiles: ['./index.html', './src/**/*'], // реагирует на изменения не только js файла
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
    }),

    new MiniCssExtractPlugin({
      filename: '[name][contenthash].css',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'], // работает справа налево
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  optimization: { // есть указываем то перезатираем стандартную оптимизацию поэтому добавили TerserPlugin для jsфайла
    // minimize: true, // если нужно минимизировать для дева тоже
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
      new TerserPlugin({ // чтобы не было лишнего файла с лицензией
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
