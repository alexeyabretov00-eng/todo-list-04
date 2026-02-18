/**
 * T057 – SubItemRow component
 * Renders a single subitem with a completion checkbox.
 * Toggle calls onToggle(subItemId, completed), supporting FR-006 and FR-017.
 */

import React from 'react';
import { Checkbox, Typography } from 'antd';
import { RowContainer } from './SubItemRow.styled';

const { Text } = Typography;

interface SubItemRowProps {
  subItem: SubItem;
  onToggle: (subItemId: string, completed: boolean) => void;
}

export function SubItemRow({ subItem, onToggle }: SubItemRowProps): React.ReactElement {
  return (
    <RowContainer>
      <Checkbox
        checked={subItem.completed}
        onChange={(e) => onToggle(subItem.id, e.target.checked)}
        aria-label={subItem.title}
      />
      <Text delete={subItem.completed}>{subItem.title}</Text>
    </RowContainer>
  );
}
