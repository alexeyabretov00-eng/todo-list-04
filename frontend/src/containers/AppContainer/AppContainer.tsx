import React, { useEffect } from 'react';
import { ErrorBanner, ListPanel } from '@components';
import { TodoListsViewContainer } from '@containers';
import { getAppContainerProps } from '@selectors';
import { createList, fetchLists, selectList } from '@slices';
import { useAppDispatch, useAppSelector } from '@store';
import { Layout, Spin, Typography } from 'antd';

const { Text } = Typography;

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
      <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <span role="status" aria-label="Loading lists…">
          <Spin size="large" />
        </span>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <ErrorBanner
          message={error}
          onRetry={() => void dispatch(fetchLists())}
        />
      </Layout>
    );
  }

  const selectedList = lists.find((l) => l.id === selectedListId) ?? null;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <ListPanel
        lists={lists}
        selectedListId={selectedListId}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />
      {selectedList ? (
        <TodoListsViewContainer listName={selectedList.name} />
      ) : (
        <Layout.Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">
            {lists.length === 0
              ? 'Create a list to get started.'
              : 'Select a list to view tasks.'}
          </Text>
        </Layout.Content>
      )}
    </Layout>
  );
}
