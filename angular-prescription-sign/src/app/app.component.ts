/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/prefer-default-export */
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import FormData from 'form-data';
import WiseApi from 'wise-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-test';

  wiseapi = null;

  file: File = null;

  certificateId: string = null

  certificate: string = null

  prescriptionId: number = null

  prescriptionDataToSign: string = null

  certificates: Array<any> = [];

  constructor(private http: HttpClient) {
    this.wiseapi = WiseApi({
      baseUrl: 'https://session-manager.homolog.v4h.cloud/api',
      domain: 'conf.homolog.v4h.cloud',
      apiKey: '******-****-****-*****-**********'
    }).then((res) => {
      this.wiseapi = res;
      this.wiseapi.prescription.listCertificates().then((certs) => {
        this.certificates = certs;
      })
    });
  }

  onChange(event) {
    this.file = event.target.files[0];
  }

  async sign() {
    const resp = await this.wiseapi.prescription.signLocal(this.certificates[0].id, this.prescriptionDataToSign);
    await this.wiseapi.prescription.sign(this.prescriptionId, { signatureValue: resp[0].signature });
  }

  async download() {
    const resp = await this.wiseapi.prescription.download(this.prescriptionId);

    const data = Uint8Array.from(resp);
    const content = new Blob([data.buffer], { type: 'application/pdf' });

    const encodedUri = window.URL.createObjectURL(content);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", 'prescription.pdf');

    link.click();
  }

  async onUpload() {
    const formData = new FormData();
    formData.append('file', this.file);
    formData.append('crm', '1231231');
    formData.append('crmUF', 'PB');
    formData.append('type', 'BASIC');
    formData.append('org', '***');
    formData.append('orgUnit', '***');
    formData.append('user', '*****');
    formData.append('certificate', this.certificates[0].base64Certificate);
    const res = await this.wiseapi.prescription.createCustom(formData);
    this.prescriptionId = res.id
    this.prescriptionDataToSign = res.dataToSign
    console.log(this.file);
  }
}
