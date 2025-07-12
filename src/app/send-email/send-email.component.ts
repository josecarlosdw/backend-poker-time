/* import { Component, OnInit } from '@angular/core';
//import { MatCard, MatCardHeader, MatCardBody, MatCardFooter } from '@angular/material/card';
//import { MatButton, MatButtonIcon } from '@angular/material/button';
//import { MatIcon } from '@angular/material/icon';
import { MailService } from '../email.service';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrls: ['./send-email.component.css']
})
export class SendEmailComponent implements OnInit {

  name?: string;
  position?: string;
  email?: string;

  constructor(private mailService: MailService) {}

  ngOnInit() {}

  ngSubmit() {
    this.mailService.sendEmail(this.name, this.position, this.email);
  }


}
 */