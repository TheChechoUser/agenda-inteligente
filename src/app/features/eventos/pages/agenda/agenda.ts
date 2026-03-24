import { EventosService } from './../../../../core/services/eventos.service';
import { Component, OnInit } from '@angular/core';
import { Evento } from '../../models/evento';
import { EventoFormComponent } from "../../components/evento-form/evento-form";
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-agenda',
  imports: [EventoFormComponent, FormsModule, DatePipe],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda implements OnInit {

  eventos: Evento[] = [];
  fechaFiltro: string = '';
  eventoSeleccionado: any = null;
  modoEdicion: boolean = false;
  eventoEditando: any = null;

  calendario: any[] = [];
  fechaActual = new Date();

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    this.loadEventos();
    this.generarCalendario();
    this.solicitarPermisoNotificaciones();
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return (
      hoy.getFullYear() === fecha.getFullYear() &&
      hoy.getMonth() === fecha.getMonth() &&
      hoy.getDate() === fecha.getDate()
    );
  }

  solicitarPermisoNotificaciones() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  loadEventos() {
    const eventos = this.eventosService.getEventos();

    this.eventos = eventos.sort((a, b) => {
      const [yA, mA, dA] = a.fecha.split('-').map(Number);
      const [hA, minA] = a.hora.split(':').map(Number);

      const [yB, mB, dB] = b.fecha.split('-').map(Number);
      const [hB, minB] = b.hora.split(':').map(Number);

      const fechaA = new Date(yA, mA - 1, dA, hA, minA);
      const fechaB = new Date(yB, mB - 1, dB, hB, minB);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  eliminar(id: number) {
    this.eventosService.deleteEvento(id);
    this.refresh();
  }

  filtrarEventos() {
    const eventos = this.eventosService.getEventos();

    if (!this.fechaFiltro) {
      this.loadEventos();
      return;
    }

    this.eventos = eventos
      .filter(e => e.fecha === this.fechaFiltro)
      .sort((a, b) => {
        const [yA, mA, dA] = a.fecha.split('-').map(Number);
        const [hA, minA] = a.hora.split(':').map(Number);

        const [yB, mB, dB] = b.fecha.split('-').map(Number);
        const [hB, minB] = b.hora.split(':').map(Number);

        const fechaA = new Date(yA, mA - 1, dA, hA, minA);
        const fechaB = new Date(yB, mB - 1, dB, hB, minB);
        return fechaA.getTime() - fechaB.getTime();
      });
  }

  limpiarFiltro() {
    this.fechaFiltro = '';
    this.loadEventos();
  }

  editarEvento(evento: any) {
    this.modoEdicion = true;
    this.eventoEditando = { ...evento };
  }

  guardarEdicion() {
    this.eventosService.updateEvento(this.eventoEditando);
    this.cerrarDetalle();
    this.refresh();
  }

  eliminarDesdeModal() {
    this.eventosService.deleteEvento(this.eventoSeleccionado.id);
    this.cerrarDetalle();
    this.refresh();
  }

  cerrarDetalle() {
    this.eventoSeleccionado = null;
    this.modoEdicion = false;
    this.eventoEditando = null;
  }

  verDetalle(evento: any) {
    this.eventoSeleccionado = evento;
  }

  refresh() {
    this.loadEventos();
    this.generarCalendario();
  }


  generarCalendario() {
    const eventos = this.eventosService.getEventos();

    const año = this.fechaActual.getFullYear();
    const mes = this.fechaActual.getMonth();

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasMes = ultimoDia.getDate();

    let inicioSemana = primerDia.getDay();
    inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1;

    const dias: any[] = [];

    for (let i = 0; i < inicioSemana; i++) {
      dias.push({
        numero: '',
        fecha: null,
        eventos: []
      });
    }


    for (let i = 1; i <= diasMes; i++) {
      const fechaObj = new Date(año, mes, i);

      const eventosDelDia = eventos.filter(e => {
        const [year, month, day] = e.fecha.split('-').map(Number);
        const f = new Date(year, month - 1, day);

        return (
          f.getFullYear() === fechaObj.getFullYear() &&
          f.getMonth() === fechaObj.getMonth() &&
          f.getDate() === fechaObj.getDate()
        );
      });

      dias.push({
        numero: i,
        fecha: fechaObj,
        eventos: eventosDelDia
      });
    }

    this.calendario = [...dias];

    while (dias.length < 42) {
  dias.push({
    numero: '',
    fecha: null,
    eventos: []
  });
}
  }
  siguienteMes() {
    this.fechaActual = new Date(
      this.fechaActual.getFullYear(),
      this.fechaActual.getMonth() + 1,
      1
    );
    this.generarCalendario();
  }

  mesAnterior() {
    this.fechaActual = new Date(
      this.fechaActual.getFullYear(),
      this.fechaActual.getMonth() - 1,
      1
    );
    this.generarCalendario();
  }

  
}