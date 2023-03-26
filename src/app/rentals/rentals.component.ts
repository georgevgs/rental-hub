import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';

import { environment } from '../../environments/environment';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rentals',
  templateUrl: './rentals.component.html',
  styleUrls: ['./rentals.component.css'],
})
export class RentalsComponent implements OnInit {
  rentalsList: any;
  currRental: any;
  closeResult = '';
  apiKey: string = '';

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    let decryptedAPIKey = '';
    this.apiKey = this.cookieService.get('apiKey');
    if (!this.apiKey || this.apiKey === '') {
      this.apiKey = environment.HOSTHUB_API_KEY;
      const encryptedAPIKey = CryptoJS.AES.encrypt(
        this.apiKey,
        'mystikoPassword'
      ).toString();

      this.cookieService.set('apiKey', encryptedAPIKey, {
        expires: 30,
        sameSite: 'Lax',
      });

      decryptedAPIKey = this.apiKey;
    } else {
      decryptedAPIKey = CryptoJS.AES.decrypt(
        this.apiKey,
        'mystikoPassword'
      ).toString(CryptoJS.enc.Utf8);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: decryptedAPIKey,
    });

    const requestOptions = { headers: headers };

    this.http
      .get('https://eric.hosthub.com/api/2019-03-01/rentals', requestOptions)
      .subscribe((res: any) => {
        this.rentalsList = res.data;
      });
  }

  open(content: any, rentalId: string) {
    const decryptedAPIKey = CryptoJS.AES.decrypt(
      this.apiKey,
      'mystikoPassword'
    ).toString(CryptoJS.enc.Utf8);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: decryptedAPIKey,
    });

    const requestOptions = { headers: headers };

    this.http
      .get(
        `https://eric.hosthub.com/api/2019-03-01/rentals/${rentalId}/calendar-events`,
        requestOptions
      )
      .subscribe((res: any) => {
        this.currRental = res.data;
      });

    this.modalService
      .open(content, { ariaLabelledBy: 'rental-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
