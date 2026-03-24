import { EventosService } from './../../../../core/services/eventos.service';
import { Component, OnInit } from '@angular/core';
import { Evento } from '../../models/evento';
import { EventoFormComponent } from "../../components/evento-form/evento-form";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agenda',
  imports: [EventoFormComponent, FormsModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda implements OnInit {

  eventos: Evento[] = [];
  fechaFiltro: string = '';
  eventoSeleccionado: any = null;
  modoEdicion: boolean = false;
  eventoEditando: any = null;

  constructor(private eventosService: EventosService) { }

  ngOnInit(): void {
    this.loadEventos();
    this.generarCalendario();
      this.solicitarPermisoNotificaciones();
  }




solicitarPermisoNotificaciones() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log('Permiso:', permission);
    });
  }
}


  loadEventos() {
    const eventos = this.eventosService.getEventos();

    this.eventos = eventos.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  eliminar(id: number) {
    this.eventosService.deleteEvento(id);
    this.loadEventos();
  }

  filtrarEventos() {
    const eventos = this.eventosService.getEventos();

    if (!this.fechaFiltro || this.fechaFiltro.trim() === '') {
      this.loadEventos();
      return;
    }

    this.eventos = eventos
      .filter(e => e.fecha === this.fechaFiltro)
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaA.getTime() - fechaB.getTime();
      });


  }
  
  editarEvento(evento: any) {
  this.modoEdicion = true;
  this.eventoEditando = { ...evento }; 
}

guardarEdicion() {
  this.eventosService.updateEvento(this.eventoEditando);
  this.cerrarDetalle();
  this.generarCalendario();
}

eliminarDesdeModal() {
  this.eventosService.deleteEvento(this.eventoSeleccionado.id);
  this.cerrarDetalle();
  this.generarCalendario();
}

cerrarDetalle() {
  this.eventoSeleccionado = null;
  this.modoEdicion = false;
  this.eventoEditando = null;
}


  limpiarFiltro() {
    this.fechaFiltro = '';
    this.loadEventos();
  }

  calendario: any[] = [];

  generarCalendario() {
    const eventos = this.eventosService.getEventos();

    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = hoy.getMonth();

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    const diasMes = ultimoDia.getDate();

    const dias: any[] = [];

    for (let i = 1; i <= diasMes; i++) {
      const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

      const eventosDelDia = eventos.filter(e => e.fecha === fecha);

      dias.push({
        numero: i,
        fecha: fecha,
        eventos: eventosDelDia
      });
    }

    this.calendario = dias;
  }

  verDetalle(evento: any) {
    this.eventoSeleccionado = evento;
  }


 
}