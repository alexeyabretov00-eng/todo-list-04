import styled from 'styled-components';

export const PanelWrapper = styled.aside`
  width: 260px;
  min-width: 200px;
  border-right: 1px solid #f0f0f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`;

export const PanelTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #262626;
`;

export const ListItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  background: ${(p) => (p.$active ? '#e6f4ff' : 'transparent')};
  color: ${(p) => (p.$active ? '#1677ff' : '#262626')};
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${(p) => (p.$active ? '#e6f4ff' : '#f5f5f5')};
  }
`;
