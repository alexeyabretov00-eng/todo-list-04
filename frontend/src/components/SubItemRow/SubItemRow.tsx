/**
 * T057/T070 – SubItemRow component
 * Renders a single subitem with a completion checkbox.
 * Toggle calls onToggle(subItemId, completed), supporting FR-006 and FR-017.
 * T070: optional onRename / onDelete for Phase 5 edit/delete wiring.
 */

import React from 'react';
import { InlineEdit } from '@components';
import { Checkbox, Typography } from 'antd';

import { RowContainer } from './SubItemRow.styled';

const { Text } = Typography;

interface SubItemRowProps {
  subItem: SubItem;
  onToggle: (subItemId: string, completed: boolean) => void;
  onRename?: (subItemId: string, newTitle: string) => void;
  onDelete?: (subItemId: string) => void;
}

export function SubItemRow({ subItem, onToggle, onRename, onDelete }: SubItemRowProps): React.ReactElement {
  return (
    <RowContainer>
      <Checkbox
        checked={subItem.completed}
        onChange={(e) => onToggle(subItem.id, e.target.checked)}
        aria-label={subItem.title}
      />
      {onRename && onDelete ? (
        <InlineEdit
          value={subItem.title}
          onRename={(newTitle) => onRename(subItem.id, newTitle)}
          onDelete={() => onDelete(subItem.id)}
        />
      ) : (
        <Text delete={subItem.completed}>{subItem.title}</Text>
      )}
    </RowContainer>
  );
}
