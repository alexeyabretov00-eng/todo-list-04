/**
 * T043 – TodoItemForm component
 * Inline error for duplicate todo title (FR-015) and 255-char limit (FR-019).
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ErrorText, FormWrapper, InputRow, StyledInput, SubmitButton } from './TodoItemForm.styled';

interface TodoItemFormProps {
  onSubmit: (title: string) => void;
  existingTitles: string[];
}

const buildSchema = (existingTitles: string[]) =>
  z.object({
    title: z
      .string()
      .min(1, 'Todo title is required')
      .max(255, 'Todo title must not exceed 255 characters')
      .refine(
        (val) => !existingTitles.map((t) => t.toLowerCase()).includes(val.toLowerCase()),
        { message: 'A todo with this title already exists in this list' }
      ),
  });

type FormValues = { title: string };

export function TodoItemForm({ onSubmit, existingTitles }: TodoItemFormProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(existingTitles)),
  });

  const handleValid = (data: FormValues) => {
    onSubmit(data.title);
    reset();
  };

  return (
    <FormWrapper onSubmit={handleSubmit(handleValid)} noValidate>
      <InputRow>
        <label htmlFor="todo-title-input" className="sr-only">
          Todo title
        </label>
        <StyledInput
          id="todo-title-input"
          aria-label="Todo title"
          placeholder="New todo title…"
          {...register('title')}
        />
        <SubmitButton type="submit">Add Todo</SubmitButton>
      </InputRow>
      {errors.title && (
        <ErrorText role="alert">{errors.title.message}</ErrorText>
      )}
    </FormWrapper>
  );
}
