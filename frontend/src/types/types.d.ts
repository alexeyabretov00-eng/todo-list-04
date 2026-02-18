// ─── Shared entity types (mirrors backend models and OpenAPI contract) ─────────

declare interface TodoList {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

declare interface TodoItem {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

declare interface SubItem {
  id: string;
  todoId: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Offline operation types (IndexedDB queue) ────────────────────────────────

declare type EntityType = 'list' | 'todo' | 'subitem';
declare type OperationType = 'create' | 'update' | 'delete' | 'reorder';

declare interface OfflineOperation {
  id: string;
  entityType: EntityType;
  operation: OperationType;
  entityId: string;
  payload: Record<string, unknown>;
  clientTimestamp: string;
  idempotencyKey: string;
  retryCount: number;
}

// ─── API response types ───────────────────────────────────────────────────────

declare interface ApiError {
  code: string;
  message: string;
}

declare interface SyncRequest {
  operations: OfflineOperation[];
}

declare interface OperationResult {
  id: string;
  status: 'applied' | 'conflicted' | 'failed';
  serverEntity?: Record<string, unknown>;
  error?: ApiError;
}

declare interface SyncResponse {
  applied: OperationResult[];
  failed: OperationResult[];
}
