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

export type ParticipantRole =
  "UNKNOWN" | "ADMINISTRATOR" | "EVALUATOR" | "EXPOSITOR" | "LISTENER";

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
