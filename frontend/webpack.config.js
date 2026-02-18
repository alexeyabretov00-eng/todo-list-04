import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { createTransformer } from 'typescript-plugin-styled-components';
import webpack from 'webpack';

const styledComponentsTransformer = createTransformer({
  ssr: false,
  displayName: true,
});

export default (env, argv) => {
  const isProduction = argv && argv.mode === 'production';
  const root = process.cwd();

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(root, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@components': path.resolve(root, 'src/components'),
        '@hooks': path.resolve(root, 'src/hooks'),
        '@utils': path.resolve(root, 'src/utils'),
        '@api': path.resolve(root, 'src/api'),
        '@styles': path.resolve(root, 'src/styles'),
        '@assets': path.resolve(root, 'src/assets'),
        '@services': path.resolve(root, 'src/services'),
        '@slices': path.resolve(root, 'src/slices'),
        '@store': path.resolve(root, 'src/store'),
        '@selectors': path.resolve(root, 'src/selectors'),
        '@containers': path.resolve(root, 'src/containers'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                getCustomTransformers: () => ({
                  before: [styledComponentsTransformer],
                }),
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env.API_PATH': JSON.stringify(process.env.API_PATH ?? '/api'),
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
    ],
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
      open: true,
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:4000',
        },
      ],
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};
