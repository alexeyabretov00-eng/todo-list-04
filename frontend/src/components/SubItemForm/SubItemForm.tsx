/**
 * T044 – SubItemForm component
 * Inline error for duplicate subitem title (FR-016) and 255-char limit (FR-019).
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ErrorText, FormWrapper, InputRow, StyledInput, SubmitButton } from './SubItemForm.styled';

interface SubItemFormProps {
  onSubmit: (title: string) => void;
  existingTitles: string[];
}

const buildSchema = (existingTitles: string[]) =>
  z.object({
    title: z
      .string()
      .min(1, 'Subitem title is required')
      .max(255, 'Subitem title must not exceed 255 characters')
      .refine(
        (val) => !existingTitles.map((t) => t.toLowerCase()).includes(val.toLowerCase()),
        { message: 'A subitem with this title already exists in this todo' }
      ),
  });

type FormValues = { title: string };

export function SubItemForm({ onSubmit, existingTitles }: SubItemFormProps): React.ReactElement {
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
        <label htmlFor="subitem-title-input" className="sr-only">
          Subitem title
        </label>
        <StyledInput
          id="subitem-title-input"
          aria-label="Subitem title"
          placeholder="New subitem title…"
          {...register('title')}
        />
        <SubmitButton type="submit">Add Subitem</SubmitButton>
      </InputRow>
      {errors.title && (
        <ErrorText role="alert">{errors.title.message}</ErrorText>
      )}
    </FormWrapper>
  );
}
