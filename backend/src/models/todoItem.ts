export interface TodoItem {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItemRow {
  id: string;
  list_id: string;
  title: string;
  completed: number; // SQLite stores booleans as 0/1
  position: number;
  created_at: string;
  updated_at: string;
}

export function rowToTodoItem(row: TodoItemRow): TodoItem {
  return {
    id: row.id,
    listId: row.list_id,
    title: row.title,
    completed: row.completed === 1,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
