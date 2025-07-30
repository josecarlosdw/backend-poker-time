import { Injectable } from '@angular/core';
//import { Mailer } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(/* private mailer: Mailer */) {}

  sendInvitationEmail(emails: string[], position: string, roomName: string) {
    // Logic to send the invitation email
    console.log('Convite enviado para email:', emails);
    console.log('Nome da sala:', roomName);
    // Implement your email sending code here
    // You can use an external email service or a custom implementation

    const mailOptions = {
      from: 'no-reply@example.com',
      to: emails,
      subject: `Invitation to ${name}'s room`,
      body: `Hi ${name},

      You are invited to join ${position} in ${name}'s room.

      To join, please click on the following link:

      https://example.com/room/${name}

      Thanks,
      The Team`
    };

    //this.mailer.send(mailOptions);
  }

}



/* import { Injectable } from '@angular/core';
import { Mailer } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private mailer: Mailer) {}

  sendEmail(name: string, position: string, email: string) {
    const mailOptions = {
      from: 'no-reply@example.com',
      to: email,
      subject: `Invitation to ${name}'s room`,
      body: `Hi ${name},

You are invited to join ${position} in ${name}'s room.

To join, please click on the following link:

https://example.com/room/${name}

Thanks,
The Team`
    };

    this.mailer.send(mailOptions);
  }

}
 */