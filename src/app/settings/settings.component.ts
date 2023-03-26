import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;

  constructor(private fb: FormBuilder, private cookieService: CookieService) {}

  ngOnInit() {
    this.settingsForm = this.fb.group({
      apiKey: [''],
      fullName: [''],
    });

    const apiKey = this.cookieService.get('apiKey');
    const fullName = this.cookieService.get('fullName');

    const decryptedAPIKey = CryptoJS.AES.decrypt(
      apiKey,
      'mystikoPassword'
    ).toString(CryptoJS.enc.Utf8);

    if (apiKey && fullName) {
      this.settingsForm.patchValue({
        apiKey: decryptedAPIKey,
        fullName: fullName,
      });
    }
  }

  saveSettings() {
    const encryptedAPIKey = CryptoJS.AES.encrypt(
      this.settingsForm.value.apiKey,
      'mystikoPassword'
    ).toString();

    this.cookieService.set('apiKey', encryptedAPIKey, {
      expires: 30,
      sameSite: 'Lax',
    });
    this.cookieService.set('fullName', this.settingsForm.value.fullName, {
      expires: 30,
      sameSite: 'Lax',
    });
  }
}
