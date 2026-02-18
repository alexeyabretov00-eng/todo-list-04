import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppContainer } from '@containers';
import { store } from '@store';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AppContainer />
    </Provider>
  </React.StrictMode>
);
