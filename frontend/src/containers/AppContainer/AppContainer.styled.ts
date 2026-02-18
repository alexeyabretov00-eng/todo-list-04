import styled, { keyframes } from 'styled-components';

export const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export const LoadingIndicator = styled.span`
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  align-self: center;
  margin-top: 20vh;
`;
