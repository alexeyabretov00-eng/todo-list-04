import styled from 'styled-components';

export const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
  color: #8c8c8c;
  text-align: center;
`;

export const EmptyMessage = styled.p`
  font-size: 14px;
  margin: 0;
`;

export const CtaButton = styled.button`
  padding: 8px 20px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0958d9;
  }
`;
