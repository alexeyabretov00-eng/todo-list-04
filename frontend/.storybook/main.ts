import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/__stories__/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      builder: {
        useSWC: false,
      },
    },
  },
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: async (config) => {
    // Reuse the project webpack config for path aliases and ts-loader with
    // typescript-plugin-styled-components transformer
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const projectWebpackConfig = require(path.resolve(__dirname, '../webpack.config.js'));
    const projectResolved = projectWebpackConfig({}, { mode: 'development' });

    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          ...projectResolved.resolve.alias,
        },
      },
      module: {
        ...config.module,
        rules: [
          // Remove existing ts rules from storybook defaults and use ours
          ...(config.module?.rules || []).filter(
            (rule) =>
              rule !== '...' &&
              typeof rule === 'object' &&
              rule !== null &&
              !(rule as { test?: RegExp }).test?.toString().includes('tsx'),
          ),
          // Our ts-loader rule with typescript-plugin-styled-components
          ...projectResolved.module.rules,
        ],
      },
    };
  },
  typescript: {
    check: false,
  },
};

export default config;
