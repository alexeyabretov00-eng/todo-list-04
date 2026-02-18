import styled from 'styled-components';

export const ViewWrapper = styled.main`
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
`;

export const ViewTitle = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #262626;
`;

export const TodoItemContainer = styled.div`
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
`;

export const TodoTitle = styled.span<{ $completed?: boolean }>`
  font-size: 14px;
  text-decoration: ${(p) => (p.$completed ? 'line-through' : 'none')};
  color: ${(p) => (p.$completed ? '#8c8c8c' : '#262626')};
`;
