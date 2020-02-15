import { Component, OnInit, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';

import * as $ from 'jquery';
import { ConnectorService } from '../connector.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {

  sqlite: boolean = false;
  postgres: boolean = false;

  connectorNameForm: FormGroup;
  connectorNameSubmitted: boolean = false;

  changeUsernameForm: FormGroup;
  changeUserSubmitted: boolean = false;

  changePasswordForm: FormGroup;
  changePasswordSubmitted: boolean = false;

  changeHostnameForm: FormGroup;
  changeHostnameSubmitted: boolean = false;

  changePortForm: FormGroup;
  changePortSubmitted: boolean = false;

  changeSchemaForm: FormGroup;
  changeSchmemaSubmitted: boolean = false;

  changeDatabaseForm: FormGroup;
  changeDatabaseSubmitted: boolean = false;

  sqlConnectorNameForm: FormGroup;
  sqlConnectorNameSub: boolean = false


  selectedConnector: any;

  connectors: any = [{"id":"No connectors are currently available"}];

  constructor(private con: ConnectorService, private formBuilder: FormBuilder, private conService: ConnectorService) { }

  async ngOnInit() {

    this.connectorNameForm = this.formBuilder.group({
      conName: ['', Validators.required]
    });

    this.changeUsernameForm = this.formBuilder.group({
      newName: ['', Validators.required]
    });

    this.changePasswordForm = this.formBuilder.group({
      newPwd: ['', Validators.required]
    });
  
    this.changeHostnameForm = this.formBuilder.group({
      hostname: ['', Validators.required]
    });

    this.changePortForm = this.formBuilder.group({
      newPort: ['', Validators.required]
    });

    this.changeSchemaForm = this.formBuilder.group({
      newSchema: ['', Validators.required]
    });

    this.changeDatabaseForm = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.sqlConnectorNameForm = this.formBuilder.group({
      conName: ['', Validators.required]
    });


    //Load all connectors
    this.connectors = await this.con.getConnector();
    this.connectors.push({"id":"Lukas", "class": "PostgreSQL"})
    

    var sel = document.getElementById('connector') as HTMLSelectElement;
    this.selectedConnector = this.connectors[0];
    
    var index = sel.selectedIndex;
    index == -1 ? index = 0 : index = index

    if(this.connectors[index].class.includes("PostreSQL")) {
      this.postgres = true;
      this.sqlite = false;
    } else if(this.connectors[index].class.includes("SQLite")) {
      this.sqlite = true;
      this.postgres = false;
    } 


    //Change the form depending on what connector it is
    sel.onchange = (event: any)=>{
      var cal = event.target.options[event.target.selectedIndex].getAttribute('id');
      this.selectedConnector = this.connectors[sel.selectedIndex];

      if(cal.includes("PostgreSQL")) {
        this.sqlite = false;
        this.postgres = true;
      } else if(cal.includes("SQLite")) {
        this.sqlite = true;
        this.postgres = false;
      }
    }
  }

  submitConnectorName() {
    this.connectorNameSubmitted = true;
    if(this.connectorNameForm.invalid) {
      return;
    }
    alert("Not implemented in the backend")
  }

  changeUsername() {
    this.changeUserSubmitted = true;
    if(this.changeUsernameForm.invalid) {
      return;
    }

    var json = {
      'id': this.selectedConnector.id,
      'database': null,
      'schema': null,
      'hostname': null,
      'port': null,
      'username': this.changeUsernameForm.value.newName,
      'password': null
    };
  }

  changePassword() {
    this.changePasswordSubmitted = true;
    if(this.changePasswordForm.invalid) {
      return;
    }

    var json = {
      'id': this.selectedConnector.id,
      'database': null,
      'schema': null,
      'hostname': null,
      'port': null,
      'username': null,
      'password': this.changePasswordForm.value.newPwd
    };
  }

  changeHostname() {
    this.changeHostnameSubmitted = true;
    if(this.changeHostnameForm.invalid) {
      return;
    } 

    var json = {
      'id': this.selectedConnector.id,
      'database': null,
      'schema': null,
      'hostname': this.changeHostnameForm.value.hostname,
      'port': null,
      'username': null,
      'password': null
    };
  }

  changePort() {
    this.changePortSubmitted = true;
    if(this.changePortForm.invalid) {
      return;
    }
    var json = {
      'id': this.selectedConnector.id,
      'database': null,
      'schema': null,
      'hostname': null,
      'port': this.changePortForm.value.newPort,
      'username': null,
      'password': null
    };
  }

  changeSchema() {
    this.changeSchmemaSubmitted = true;
    if(this.changeSchemaForm.invalid) {
      return;
    }

    var json = {
      'id': this.selectedConnector.id,
      'database': null,
      'schema': this.changeSchemaForm.value.newSchema,
      'hostname': null,
      'port': null,
      'username': null,
      'password': null
    };
  }

  changeDatabase() {
    this.changeDatabaseSubmitted = true;
    if(this.changeDatabaseForm.invalid) {
      return;
    }

    var json = {
      'id': this.selectedConnector.id,
      'database': this.changeDatabaseForm.value.name,
      'schema': null,
      'hostname': null,
      'port': null,
      'username': null,
      'password': null
    };
  }

  delConnector() {
    var er = document.getElementById("infoField");
    this.conService.deleteConnector({'id': this.selectedConnector.id}).then(()=>{
      er.style.marginTop = "2%";
          er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                        <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                            <p>
                                Connection deleted
                            </p>
                            </div>
                    </div>`;
    }).catch((err)=>{
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                    <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                    <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                        <p>
                            Connection not deleted
                        </p>
                        </div>
                </div>`;
    });

  }

  sqLiteConnectorName() {
    this.sqlConnectorNameSub = true;
    if(this.sqlConnectorNameForm.invalid) {
      return;
    }
  }


}
