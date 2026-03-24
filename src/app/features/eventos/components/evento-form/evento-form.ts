import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventosService } from '../../../../core/services/eventos.service';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './evento-form.html',
  styleUrl: './evento-form.css'
})
export class EventoFormComponent {

  @Output() actualizado = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder, private eventosService: EventosService) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    });
  }


 guardar() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const evento = {
    id: Date.now(),
    ...this.form.value
  };

  const ok = this.eventosService.addEvento(evento as any);

  if (!ok) {
    alert('Ya existe un evento en esa fecha y hora');
    return;
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Evento creado', {
      body: `${evento.titulo} - ${evento.fecha} ${evento.hora}`
    });
  }

  this.form.reset();
  this.actualizado.emit();
}


mostrarNotificacion(titulo: string, mensaje: string) {
  if (Notification.permission === 'granted') {
    new Notification(titulo, {
      body: mensaje,
      icon: 'assets/icons/icon-192x192.png'
    });
  }
}
verificarEventosProximos() {
  const eventos = this.eventosService.getEventos();
  const ahora = new Date();

  eventos.forEach(e => {
    const [year, month, day] = e.fecha.split('-').map(Number);
    const [hours, minutes] = e.hora.split(':').map(Number);

    const fechaEvento = new Date(year, month - 1, day, hours, minutes);

    const diff = fechaEvento.getTime() - ahora.getTime();

    if (diff > 0 && diff < 60000) {
      this.mostrarNotificacion(
        'Evento próximo',
        `${e.titulo} empieza en menos de 1 minuto`
      );
    }
  });
}
}