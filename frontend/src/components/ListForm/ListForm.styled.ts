import styled from 'styled-components';

export const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
`;

export const InputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

export const StyledInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
  }
`;

export const SubmitButton = styled.button`
  padding: 6px 16px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;

  &:hover {
    background: #0958d9;
  }
`;

export const ErrorText = styled.p`
  color: #ff4d4f;
  font-size: 12px;
  margin: 0;
`;
