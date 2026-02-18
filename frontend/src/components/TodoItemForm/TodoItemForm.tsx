/**
 * T043 – TodoItemForm component
 * Inline error for duplicate todo title (FR-015) and 255-char limit (FR-019).
 */

import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { z } from 'zod';

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

export function TodoItemForm({ onSubmit, existingTitles }: TodoItemFormProps): React.ReactElement {
  const [form] = Form.useForm<{ title: string }>();

  const handleFinish = (values: { title: string }) => {
    onSubmit(values.title);
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical" style={{ padding: '8px 0' }}>
      <Form.Item
        name="title"
        rules={[
          { required: true, message: <span role="alert">Todo title is required</span> },
          { max: 255, message: <span role="alert">Todo title must not exceed 255 characters</span> },
          {
            validator: (_, value: string) => {
              const result = buildSchema(existingTitles).safeParse({ title: value ?? '' });
              if (!result.success) {
                const msg = result.error.issues[0]?.message;
                if (msg && msg !== 'Todo title is required' && msg !== 'Todo title must not exceed 255 characters') {
                  return Promise.reject(<span role="alert">{msg}</span>);
                }
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Space.Compact style={{ width: '100%' }}>
          <Input
            id="todo-title-input"
            aria-label="Todo title"
            placeholder="New todo title…"
          />
          <Button type="primary" htmlType="submit">
            Add Todo
          </Button>
        </Space.Compact>
      </Form.Item>
    </Form>
  );
}
