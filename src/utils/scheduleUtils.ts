
/**
 * Utility functions for working with schedules
 */

// Funzione per formattare una data in formato locale
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Funzione per convertire un'ora in fascia oraria
export function getTimeRange(hour: string): string {
  const hourMap: Record<string, string> = {
    '8:30': '8:30-9:30',
    '9:30': '9:30-10:30',
    '10:30': '10:30-11:30',
    '11:30': '11:30-12:30',
    '12:30': '12:30-13:30',
    '13:30': '13:30-14:30'
  };
  
  return hourMap[hour] || hour;
}

// Lista delle opzioni speciali per le sostituzioni
export const SPECIAL_REPLACEMENT_OPTIONS = [
  "Entra alle 9:30",
  "Entra alle 10:30",
  "Esce alle 10:30",
  "Esce alle 11:30",
  "Esce alle 12:30", 
  "Esce alle 13:30",
  "No DIS"
];

// Verifica se un docente è disponibile in un determinato giorno e ora
export function isTeacherAvailable(teacher: any, day: string, hour: string): boolean {
  if (!teacher) return false;
  // Se il docente non ha lezione in questa ora (cella vuota o non definita), è disponibile
  return !teacher.schedule[day] || !teacher.schedule[day][hour];
}

// ---------------------------------------------------------------------------
// Variazioni di orario (anticipo ultima ora / posticipo prima ora)
// ---------------------------------------------------------------------------

export const ORDERED_HOURS = ['8:30', '9:30', '10:30', '11:30', '12:30', '13:30', '14:30'];

function hourEnd(hour: string): string {
  const [h, m] = hour.split(':').map(Number);
  return `${h + 1}:${String(m).padStart(2, '0')}`;
}

const normCell = (v: unknown) => String(v ?? '').trim().toLocaleUpperCase('it');

export type ScheduleVariation = {
  type: 'anticipo' | 'posticipo';
  teacherId: string;
  teacherName: string;
  fromHour: string;   // ora originale della lezione spostata
  toHour: string;     // ora dell'assenza
  label: string;      // descrizione per l'utente
  variation: string;  // testo breve salvato nella sostituzione
};

/**
 * Calcola le possibili variazioni di orario per la classe nella fascia dell'assenza.
 * - Anticipo: il docente dell'ultima ora della classe, libero (o DISP) nell'ora dell'assenza,
 *   anticipa la sua lezione e la classe esce un'ora prima.
 * - Posticipo: il docente della prima ora della classe, libero (o DISP) nell'ora dell'assenza,
 *   posticipa la sua lezione e la classe entra un'ora dopo.
 * Valgono solo se l'assenza NON è nella prima/ultima ora della classe.
 */
export function getScheduleVariations(
  teachers: any[], absentTeacherId: string, day: string, hour: string, className: string
): ScheduleVariation[] {
  const cls = normCell(className);
  if (!cls || cls === 'DISP' || cls === 'DIS') return [];

  const classHours = ORDERED_HOURS.filter(h =>
    teachers.some(t => normCell(t.schedule?.[day]?.[h]) === cls)
  );
  const idx = classHours.indexOf(hour);
  if (idx === -1 || classHours.length < 2) return [];

  const first = classHours[0];
  const last = classHours[classHours.length - 1];
  const freeAt = (t: any, h: string) => {
    const v = normCell(t.schedule?.[day]?.[h]);
    return v === '' || v === 'DISP' || v === 'DIS';
  };
  const out: ScheduleVariation[] = [];

  if (hour !== last) {
    teachers
      .filter(t => t.id !== absentTeacherId && normCell(t.schedule?.[day]?.[last]) === cls && freeAt(t, hour))
      .forEach(t => out.push({
        type: 'anticipo', teacherId: t.id, teacherName: t.name, fromHour: last, toHour: hour,
        label: `${t.name}: anticipa la lezione delle ${last} alle ${hour} — la classe esce alle ${last}`,
        variation: `Anticipo lezione ${last} → ${hour}, esce alle ${last}`,
      }));
  }

  if (hour !== first) {
    const second = classHours[1];
    teachers
      .filter(t => t.id !== absentTeacherId && normCell(t.schedule?.[day]?.[first]) === cls && freeAt(t, hour))
      .forEach(t => out.push({
        type: 'posticipo', teacherId: t.id, teacherName: t.name, fromHour: first, toHour: hour,
        label: `${t.name}: posticipa la lezione delle ${first} alle ${hour} — la classe entra alle ${second}`,
        variation: `Posticipo lezione ${first} → ${hour}, entra alle ${second}`,
      }));
  }

  return out;
}

export { hourEnd };
