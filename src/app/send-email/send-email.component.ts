import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-send-email',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css']
})
export class SendEmailComponent {
  name: string = '';
  position: string = '';
  email: string = '';

  sendEmail() {
    // Aqui você pode integrar com serviço real de e-mail futuramente
    alert(`Convite enviado para ${this.email} para a posição ${this.position} na sala de ${this.name}`);
    this.name = '';
    this.position = '';
    this.email = '';
  }
}