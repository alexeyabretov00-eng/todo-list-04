import styled from 'styled-components';

export const ReorderListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const ReorderListItem = styled.li<{ $isDragging: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  background: ${({ $isDragging }) => ($isDragging ? '#e6f4ff' : 'transparent')};
  border: 1px solid ${({ $isDragging }) => ($isDragging ? '#1677ff' : 'transparent')};
  cursor: grab;
  user-select: none;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: #fafafa;
  }

  &:active {
    cursor: grabbing;
  }
`;

export const DragHandle = styled.span`
  color: #bfbfbf;
  font-size: 14px;
  line-height: 1;
  cursor: grab;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
`;
