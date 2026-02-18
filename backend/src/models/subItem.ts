export interface SubItem {
  id: string;
  todoId: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubItemRow {
  id: string;
  todo_id: string;
  title: string;
  completed: number; // SQLite stores booleans as 0/1
  position: number;
  created_at: string;
  updated_at: string;
}

export function rowToSubItem(row: SubItemRow): SubItem {
  return {
    id: row.id,
    todoId: row.todo_id,
    title: row.title,
    completed: row.completed === 1,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
