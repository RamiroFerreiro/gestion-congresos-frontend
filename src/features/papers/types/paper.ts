export interface Paper {
  id: number;
  title: string;
  status: string;
}

export interface CreatePaperRequest {
  title: string;
}