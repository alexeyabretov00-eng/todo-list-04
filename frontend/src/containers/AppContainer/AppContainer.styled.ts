import styled, { keyframes } from 'styled-components';

export const AppWrapper = styled.div`
  display: flex;
  min-height: 100vh;
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
  margin: 20vh auto;
`;

export const FullPageCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
`;
