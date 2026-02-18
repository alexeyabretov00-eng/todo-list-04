import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { default as createStyledComponentsTransformer } from 'typescript-plugin-styled-components';

const styledComponentsTransformer = createStyledComponentsTransformer({
  ssr: false,
  displayName: true,
});

module.exports = (env, argv) => {
  const isProduction = argv && argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@slices': path.resolve(__dirname, 'src/slices'),
        '@store': path.resolve(__dirname, 'src/store'),
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
        favicon: './public/favicon.ico',
      }),
    ],
    devServer: {
      port: 3000,
      historyApiFallback: true,
      hot: true,
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
