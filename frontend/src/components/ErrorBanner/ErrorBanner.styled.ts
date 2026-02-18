import styled from 'styled-components';

export const BannerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  margin: 16px 0;
`;

export const ErrorMessage = styled.p`
  color: #a8071a;
  font-size: 14px;
  margin: 0;
  flex: 1;
`;

export const RetryButton = styled.button`
  padding: 4px 14px;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;

  &:hover {
    background: #d9363e;
  }
`;
