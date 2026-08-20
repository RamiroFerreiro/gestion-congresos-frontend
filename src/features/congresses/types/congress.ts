export interface Congress {
  id: number;
  name: string;
  enabled: boolean;
}

export interface CreateCongressRequest {
  name: string;
}

export interface UpdateCongressRequest {
  name: string;
}

export type CongressRole = string;