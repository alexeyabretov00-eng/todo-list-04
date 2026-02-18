/**
 * T044 – SubItemForm component
 * Inline error for duplicate subitem title (FR-016) and 255-char limit (FR-019).
 */

import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { z } from 'zod';

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

export function SubItemForm({ onSubmit, existingTitles }: SubItemFormProps): React.ReactElement {
  const [form] = Form.useForm<{ title: string }>();

  const handleFinish = (values: { title: string }) => {
    onSubmit(values.title);
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical" style={{ padding: '4px 0' }}>
      <Form.Item
        name="title"
        rules={[
          { required: true, message: <span role="alert">Subitem title is required</span> },
          { max: 255, message: <span role="alert">Subitem title must not exceed 255 characters</span> },
          {
            validator: (_, value: string) => {
              const result = buildSchema(existingTitles).safeParse({ title: value ?? '' });
              if (!result.success) {
                const msg = result.error.issues[0]?.message;
                if (msg && msg !== 'Subitem title is required' && msg !== 'Subitem title must not exceed 255 characters') {
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
            id="subitem-title-input"
            aria-label="Subitem title"
            placeholder="New subitem title…"
          />
          <Button type="primary" htmlType="submit" size="small">
            Add Subitem
          </Button>
        </Space.Compact>
      </Form.Item>
    </Form>
  );
}
