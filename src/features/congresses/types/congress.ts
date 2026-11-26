export interface Congress {
  id: number;
  name: string;
  enabled: boolean;
}

export type { CreateCongressRequest } from "./createCongress";

export interface UpdateCongressRequest {
  name: string;
}

export type CongressRole = string;

/** Contrato del listado actual; separado de los tipos de las pruebas legacy. */
export interface AvailableCongress {
  congressId: number;
  code: string;
  name: string;
  place: string;
  enabled: boolean;
  registrationStartDate: string;
  registrationEndDate: string;
  presentationStartDate: string;
  presentationEndDate: string;
  startDate: string;
  endDate: string;
}

/** Campos de GET /api/congresses/{congressCode} utilizados por las pantallas. */
export interface CongressDetails extends AvailableCongress {
  thematicAreas: string[];
  free: boolean;
  singleBlind: boolean;
  contactMail: string;
}

export type ParticipantRole =
  "UNKNOWN" | "ADMINISTRATOR" | "EVALUATOR" | "EXPOSITOR" | "LISTENER";

export type MyCongressRole =
  Exclude<ParticipantRole, "UNKNOWN"> | "SUPER_ADMIN";

/** Contrato de GET /api/congresses/mine. */
export interface MyCongressSummary {
  code: string;
  name: string;
  place: string;
  enabled: boolean;
  startDate: string;
  endDate: string;
  presentationStartDate: string;
  presentationEndDate: string;
  role: MyCongressRole;
  institution: string | null;
}

export interface CongressParticipation {
  idCongressParticipant: number;
  user: {
    userId: number;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: ParticipantRole;
  institution: string | null;
  active: boolean;
  registrationDate: string;
}

export interface CongressMessage {
  message: string;
}
