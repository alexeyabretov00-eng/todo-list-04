/**
 * T042 – ListForm component
 * Controlled form with Zod + react-hook-form validation.
 * Displays inline error for duplicate list name (FR-014) and 255-char limit (FR-019).
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ErrorText, FormWrapper, InputRow, StyledInput, SubmitButton } from './ListForm.styled';

interface ListFormProps {
  onSubmit: (name: string) => void;
  existingNames: string[];
}

const buildSchema = (existingNames: string[]) =>
  z.object({
    name: z
      .string()
      .min(1, 'List name is required')
      .max(255, 'List name must not exceed 255 characters')
      .refine(
        (val) => !existingNames.map((n) => n.toLowerCase()).includes(val.toLowerCase()),
        { message: 'A list with this name already exists' }
      ),
  });

type FormValues = { name: string };

export function ListForm({ onSubmit, existingNames }: ListFormProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(existingNames)),
  });

  const handleValid = (data: FormValues) => {
    onSubmit(data.name);
    reset();
  };

  return (
    <FormWrapper onSubmit={handleSubmit(handleValid)} noValidate>
      <InputRow>
        <label htmlFor="list-name-input" className="sr-only">
          List name
        </label>
        <StyledInput
          id="list-name-input"
          aria-label="List name"
          placeholder="New list name…"
          {...register('name')}
        />
        <SubmitButton type="submit">Add List</SubmitButton>
      </InputRow>
      {errors.name && (
        <ErrorText role="alert">{errors.name.message}</ErrorText>
      )}
    </FormWrapper>
  );
}
