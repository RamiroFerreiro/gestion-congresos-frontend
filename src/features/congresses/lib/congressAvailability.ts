import type { AvailableCongress } from "../types/congress";

type CongressSchedule = Pick<
  AvailableCongress,
  | "enabled"
  | "startDate"
  | "endDate"
  | "presentationStartDate"
  | "presentationEndDate"
>;

export function getCongressStatus(congress: CongressSchedule, now: Date) {
  const congressEnd = new Date(congress.endDate).getTime();
  const submissionStart = new Date(congress.presentationStartDate).getTime();
  const submissionEnd = new Date(congress.presentationEndDate).getTime();
  const time = now.getTime();
  const finished = time > congressEnd;
  const disabled = !congress.enabled;

  let label = "Inscripción cerrada";
  if (disabled) label = "Deshabilitado";
  else if (finished) label = "Finalizado";
  else if (time >= submissionStart && time <= submissionEnd)
    label = "Recepción abierta";
  else if (time >= new Date(congress.startDate).getTime()) label = "En curso";

  return { label, finished, disabled };
}

export function getCongressAvailability(
  congress: AvailableCongress,
  now: Date,
) {
  // La API usa LocalDateTime sin offset. Se interpreta en el horario local,
  // igual que los formularios existentes; el servidor vuelve a validar al enviar.
  const registrationStart = new Date(congress.registrationStartDate).getTime();
  const registrationEnd = new Date(congress.registrationEndDate).getTime();
  const time = now.getTime();
  const status = getCongressStatus(congress, now);
  const canRegister =
    congress.enabled &&
    !status.finished &&
    time >= registrationStart &&
    time <= registrationEnd;

  let label = status.label;
  if (!status.disabled && !status.finished && time < registrationStart) {
    label = "Inscripción próximamente";
  } else if (!status.disabled && !status.finished && canRegister) {
    label = "Inscripción abierta";
  }

  return { canRegister, label, finished: status.finished };
}
