export interface CongressBankDetailsRequest {
  bankName: string;
  accountHolder: string;
  cbuCvu: string;
  cuitCuil: string;
  alias: string;
}

/** JSON de CongressRequestDTO: Jackson publica los booleanos como free y singleBlind. */
export interface CreateCongressRequest {
  name: string;
  place: string;
  contactMail: string;
  thematicAreas: string[];
  registrationStartDate: string;
  registrationEndDate: string;
  presentationStartDate: string;
  presentationEndDate: string;
  startDate: string;
  endDate: string;
  maxNumberOfAuthors: number | null;
  minKeywords: number | null;
  maxKeywords: number | null;
  keywordRepetition: boolean;
  singleBlind: boolean;
  evaluationReleaseMode: "IMMEDIATE" | "BATCH";
  plannedEvaluationReleaseDate: string | null;
  free: boolean;
  abstractAmount: number;
  abstractCurrency: string | null;
  bankDetailRequestDTO: CongressBankDetailsRequest | null;
}

/** Datos de la respuesta real necesarios para confirmar la creación. */
export interface CreatedCongress {
  congressId: number;
  code: string;
  name: string;
}
