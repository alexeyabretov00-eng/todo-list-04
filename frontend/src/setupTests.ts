/* eslint-disable @typescript-eslint/no-require-imports */
import '@testing-library/jest-dom';

// antd uses window.matchMedia internally; jsdom does not implement it.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

// antd Form uses MessageChannel internally; polyfill for jsdom.
if (typeof MessageChannel === 'undefined') {
  const { MessageChannel: NodeMessageChannel } = require('worker_threads') as typeof import('worker_threads');
  (global as unknown as Record<string, unknown>).MessageChannel = NodeMessageChannel;
}
