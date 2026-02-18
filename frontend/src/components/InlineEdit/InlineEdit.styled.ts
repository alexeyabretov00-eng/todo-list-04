import styled from 'styled-components';

export const InlineEditContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

export const DisplayText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EditInput = styled.input`
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: inherit;
  font-family: inherit;
  outline: none;

  &:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
  }
`;
