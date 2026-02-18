/**
 * T042 – ListForm component
 * Controlled form with Zod validation via antd Form.
 * Displays inline error for duplicate list name (FR-014) and 255-char limit (FR-019).
 */

import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { z } from 'zod';

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

export function ListForm({ onSubmit, existingNames }: ListFormProps): React.ReactElement {
  const [form] = Form.useForm<{ name: string }>();

  const handleFinish = (values: { name: string }) => {
    onSubmit(values.name);
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical" style={{ padding: '8px 0' }}>
      <Form.Item
        name="name"
        rules={[
          { required: true, message: <span role="alert">List name is required</span> },
          { max: 255, message: <span role="alert">List name must not exceed 255 characters</span> },
          {
            validator: (_, value: string) => {
              const result = buildSchema(existingNames).safeParse({ name: value ?? '' });
              if (!result.success) {
                const msg = result.error.issues[0]?.message;
                if (msg && msg !== 'List name is required' && msg !== 'List name must not exceed 255 characters') {
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
            id="list-name-input"
            aria-label="List name"
            placeholder="New list name…"
          />
          <Button type="primary" htmlType="submit">
            Add List
          </Button>
        </Space.Compact>
      </Form.Item>
    </Form>
  );
}
