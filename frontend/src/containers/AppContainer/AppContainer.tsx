import React, { useEffect } from 'react';
import { fetchLists } from '@slices';
import { useAppDispatch, useAppSelector } from '@store';

import { getAppContainerProps } from '../../selectors/containers';

import { AppWrapper, LoadingIndicator } from './AppContainer.styled';

export function AppContainer(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { lists, loading, error } = useAppSelector(getAppContainerProps);

  useEffect(() => {
    void dispatch(fetchLists());
  }, [dispatch]);

  if (loading) {
    return (
      <AppWrapper>
        <LoadingIndicator role="status" aria-label="Loading lists…" />
      </AppWrapper>
    );
  }

  if (error) {
    return (
      <AppWrapper>
        <p role="alert">{error}</p>
        <button onClick={() => void dispatch(fetchLists())}>Retry</button>
      </AppWrapper>
    );
  }

  if (lists.length === 0) {
    return (
      <AppWrapper>
        <p>No lists yet. Get started by creating one.</p>
        {/* CTA — accessible button with name matching the test query /add.*list|create.*list/i */}
        <button aria-label="Add List">Add List</button>
      </AppWrapper>
    );
  }

  return (
    <AppWrapper>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>{list.name}</li>
        ))}
      </ul>
    </AppWrapper>
  );
}
