import { Injectable } from '@angular/core';
import { Evento } from '../../features/eventos/models/evento';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private key = 'eventos';

  getEventos(): Evento[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  saveEventos(eventos: Evento[]) {
    localStorage.setItem(this.key, JSON.stringify(eventos));
  }

  addEvento(evento: Evento): boolean {
    const eventos = this.getEventos();

    const conflicto = eventos.some(e =>
      e.fecha === evento.fecha &&
      e.hora === evento.hora
    );

    if (conflicto) return false;

    eventos.push(evento);
    this.saveEventos(eventos);
    return true;
  }

  deleteEvento(id: number) {
    const eventos = this.getEventos().filter(e => e.id !== id);
    this.saveEventos(eventos);
  }
  updateEvento(eventoActualizado: any) {
  const eventos = this.getEventos().map(e =>
    e.id === eventoActualizado.id ? eventoActualizado : e
  );

  this.saveEventos(eventos);
}

}