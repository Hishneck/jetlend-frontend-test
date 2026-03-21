export type Project = {
  id: number;
  name: string;
  code: string;
};

export type User = {
  id: number;
  name: string;
};

export type Task = {
  id: number;
  name: string;
  project_id: number;
  estimate: number;
  responsible_id: number | null;
};

export type ApiResponse<T> = {
  status: 'OK';
  data: T;
};