export interface AbstractBookAuthor {
  authorOrder: number | null;
  firstName: string | null;
  lastName: string | null;
  institution: string | null;
  email: string | null;
}

export interface AbstractBookPaper {
  code: string;
  title: string;
  thematicArea: string;
  summary: string;
  keywords: string[];
  authors: AbstractBookAuthor[];
}
