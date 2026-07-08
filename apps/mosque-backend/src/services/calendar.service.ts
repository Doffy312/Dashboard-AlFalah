import * as ics from 'ics';
import { CreateProgramInput } from './programs.service.js';

export class CalendarService {
  /**
   * Men-generate string kalender (.ics) dengan alarm (VALARM)
   */
  createProgramEvent(program: CreateProgramInput): Promise<string> {
    return new Promise((resolve, reject) => {
      // Parsing tanggal (format YYYY-MM-DD)
      const [year, month, day] = program.date.split('-').map(Number);
      
      const event: ics.EventAttributes = {
        start: [year, month, day], // format: [YYYY, MM, DD] untuk all-day event
        title: `[Program Kerja] ${program.name}`,
        description: `PIC: ${program.pic}\nStatus: ${program.status}\nAnggaran: Rp ${program.budget}\n\n${program.description}`,
        location: 'Masjid',
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'Pengurus Masjid', email: 'noreply@masjid.id' },
        alarms: [
          {
            action: 'display',
            description: 'Pengingat Program Kerja',
            trigger: { hours: 24, minutes: 0, before: true }, // Pengingat H-1
          },
          {
            action: 'audio',
            description: 'Pengingat Program Kerja',
            trigger: { hours: 2, minutes: 0, before: true }, // Pengingat 2 jam sebelumnya
          }
        ],
      };

      ics.createEvent(event, (error, value) => {
        if (error) {
          console.error('Gagal membuat event kalender:', error);
          reject(error);
          return;
        }
        resolve(value);
      });
    });
  }

  /**
   * Men-generate feed kalender dari banyak program
   */
  createProgramsFeed(programs: any[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const events: ics.EventAttributes[] = programs.map((p) => {
        const [year, month, day] = (typeof p.date === 'string' ? p.date : p.date.toISOString().split('T')[0]).split('-').map(Number);
        return {
          start: [year, month, day],
          title: `[Program Kerja] ${p.name}`,
          description: `PIC: ${p.pic}\nStatus: ${p.status}\n\n${p.description}`,
          location: 'Masjid',
          status: p.status === 'Direncanakan' ? 'TENTATIVE' : 'CONFIRMED',
          alarms: [
            {
              action: 'display',
              description: 'Pengingat Program Kerja',
              trigger: { hours: 24, minutes: 0, before: true },
            }
          ]
        };
      });

      if (events.length === 0) {
        // Return empty calendar if no events
        resolve('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Sistem Masjid//EN\r\nEND:VCALENDAR');
        return;
      }

      ics.createEvents(events, (error, value) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(value);
      });
    });
  }
}

export const calendarService = new CalendarService();
