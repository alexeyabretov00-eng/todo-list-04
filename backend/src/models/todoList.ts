export interface TodoList {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoListRow {
  id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export function rowToTodoList(row: TodoListRow): TodoList {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
