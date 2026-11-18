import type {
  AbstractBookAuthor,
  AbstractBookPaper,
} from "../types/abstractBook";

export function authorName(author: AbstractBookAuthor) {
  return [author.lastName, author.firstName].filter(Boolean).join(", ");
}

export function summaryText(summary: string) {
  const document = new DOMParser().parseFromString(summary, "text/html");
  document
    .querySelectorAll("script,style,iframe,object")
    .forEach((element) => element.remove());
  document
    .querySelectorAll("br")
    .forEach((element) => element.replaceWith("\n"));
  document
    .querySelectorAll("p,blockquote")
    .forEach((element) => element.append("\n\n"));
  return document.body.textContent?.trim() ?? "";
}

function csvCell(value: string) {
  const safeValue = /^[\s\u0000-\u001f]*[=+@-]/.test(value)
    ? `'${value}`
    : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function abstractBookCsv(papers: AbstractBookPaper[]) {
  const rows = [
    [
      "Código",
      "Título",
      "Área temática",
      "Autores",
      "Instituciones",
      "Correos",
      "Palabras clave",
      "Resumen",
    ],
    ...papers.map((paper) => [
      paper.code,
      paper.title,
      paper.thematicArea,
      paper.authors.map(authorName).join("; "),
      paper.authors.map((author) => author.institution ?? "").join("; "),
      paper.authors.map((author) => author.email ?? "").join("; "),
      paper.keywords.join("; "),
      summaryText(paper.summary),
    ]),
  ];
  return new Blob(
    ["\uFEFF", rows.map((row) => row.map(csvCell).join(",")).join("\r\n")],
    {
      type: "text/csv;charset=utf-8",
    },
  );
}

export function downloadBook(
  blob: Blob,
  congressCode: string,
  extension: "docx" | "csv",
) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `libro-resumenes-${congressCode.replace(/[^\p{L}\p{N}._-]/gu, "-")}.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
