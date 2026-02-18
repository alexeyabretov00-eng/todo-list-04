import React, { useEffect } from 'react';
import { createList, fetchLists, selectList } from '@slices';
import { useAppDispatch, useAppSelector } from '@store';

import { ErrorBanner } from '../../components/ErrorBanner';
import { ListPanel } from '../../components/ListPanel';
import { getAppContainerProps } from '../../selectors/containers';
import { TodoListsViewContainer } from '../TodoListsViewContainer';

import {
  AppWrapper,
  FullPageCenter,
  LoadingIndicator,
} from './AppContainer.styled';

export function AppContainer(): React.ReactElement {
  const dispatch = useAppDispatch();
  const { lists, selectedListId, loading, error } =
    useAppSelector(getAppContainerProps);

  useEffect(() => {
    void dispatch(fetchLists());
  }, [dispatch]);

  const handleSelectList = (id: string) => {
    dispatch(selectList(id));
  };

  const handleCreateList = (name: string) => {
    void dispatch(createList(name));
  };

  if (loading) {
    return (
      <FullPageCenter>
        <LoadingIndicator role="status" aria-label="Loading lists…" />
      </FullPageCenter>
    );
  }

  if (error) {
    return (
      <FullPageCenter>
        <ErrorBanner
          message={error}
          onRetry={() => void dispatch(fetchLists())}
        />
      </FullPageCenter>
    );
  }

  const selectedList = lists.find((l) => l.id === selectedListId) ?? null;

  return (
    <AppWrapper>
      <ListPanel
        lists={lists}
        selectedListId={selectedListId}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />
      {selectedList ? (
        <TodoListsViewContainer listName={selectedList.name} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#8c8c8c' }}>
            {lists.length === 0
              ? 'Create a list to get started.'
              : 'Select a list to view tasks.'}
          </p>
        </div>
      )}
    </AppWrapper>
  );
}
