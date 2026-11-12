import type { AvailableCongress } from "../types/congress";

export function getCongressAvailability(
  congress: AvailableCongress,
  now: Date,
) {
  // La API usa LocalDateTime sin offset. Se interpreta en el horario local,
  // igual que los formularios existentes; el servidor vuelve a validar al enviar.
  const registrationStart = new Date(congress.registrationStartDate).getTime();
  const registrationEnd = new Date(congress.registrationEndDate).getTime();
  const congressEnd = new Date(congress.endDate).getTime();
  const submissionStart = new Date(congress.presentationStartDate).getTime();
  const submissionEnd = new Date(congress.presentationEndDate).getTime();
  const time = now.getTime();
  const finished = time > congressEnd;
  const canRegister =
    congress.enabled &&
    !finished &&
    time >= registrationStart &&
    time <= registrationEnd;

  let label = "Inscripción cerrada";
  if (finished) label = "Finalizado";
  else if (time < registrationStart) label = "Inscripción próximamente";
  else if (time >= submissionStart && time <= submissionEnd)
    label = "Recepción abierta";
  else if (canRegister) label = "Inscripción abierta";
  else if (time >= new Date(congress.startDate).getTime()) label = "En curso";

  return { canRegister, label, finished };
}
