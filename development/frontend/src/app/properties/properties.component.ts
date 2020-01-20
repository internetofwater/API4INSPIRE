import { Component, OnInit } from '@angular/core';

import * as $ from 'jquery';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.showSQLite();
    var sel = document.getElementById('connector');
    sel.onchange = (event: any)=>{
      var cal = event.target.options[event.target.selectedIndex].getAttribute('id');
      if(cal == "postgres") {
        this.showPostgres();
      } else if(cal == "sqlite") {
        this.showSQLite();
      }
    }
  }

  showSQLite() {
    var cont = $('#content');
    cont.html("" +
    '<div class="row" style="width: 100%; margin-top: 1%">' +
      '<div class="col-sm-6">' +
          '    <label for="path">Path so sqlite</label>' +
          '<input type="file" class="form-control-file shadow-sm" style="width: 100%" id="path">' +
        '</div>' +
        '<div class="col-sm-6">' +
          '<button class="btn btn-success shadow-sm" style="width: 100%; height: 100%">Change path</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<hr />');
  }

  showPostgres() {
    var cont = $('#content');
    cont.html("" +
      '<h3 style="margin-top: 1%">Change credentials</h3>' +
      '<hr />' +
      '<div class="row" style="width: 100%">' +
        '<div class="col-sm-6">' +
          '<input type="text" class="form-control shadow-sm" style="width: 100%; margin-top: 1%" placeholder="Username" />' +
        '</div>' +
        '<div class="col-sm-6">' +
          '<button class="btn btn-success shadow-sm" style="width: 100%; margin-top: 1%">Change username</button>' +
        '</div>' +
      '</div>' +
      '<div class="row" style="width: 100%; margin-top: 1%">' +
        '<div class="col-sm-6">' +
          '<input type="text" style="width: 100%; margin-top: 1%" class="shadow-sm form-control" placeholder="Old password" />' +
        '</div>' +
      '</div>' +
      '<div class="row" style="width: 100%; margin-top: 1%">' +
        '<div class="col-sm-6">' +
          '<input class="form-control shadow-sm" style="width: 100%; margin-top: 1%" type="text" placeholder="New password" />' +
        '</div>' +
      '</div>' +
      '<div class="row" style="width: 100%; margin-top: 1%">' +
        '<div class="col-sm-6">' +
          '<input type="text" class="form-control shadow-sm" style="width: 100%; margin-top: 1%" placeholder="Repeat new password" />' +
        '</div>' +
        '<div class="col-sm-6">' +
          '<button class="btn btn-success shadow-sm" style="width: 100%; margin-top: 1%">Change password</button>' +
        '</div>' +
      '</div>' +
      '<hr />' +
      '<div class="row" style="width: 100%">' + 
        '<div class="col-sm-6">' +
          '<input type="text" class="form-control shadow-sm" style="width: 100%; margin-top: 1%" placeholder="Hostname"/>' +
        '</div>' +
        '<div class="col-sm-6">' +
          '<button class="btn btn-success shadow-sm" style="width: 100%; margin-top: 1%">Change hostname</button>' +
        '</div>' +
      '</div>' +
      '<div class="row" style="width: 100%; margin-top: 1%">' +
        '<div class="col-sm-6">' +
          '<input type="number" class="form-control shadow-sm" style="width: 100%; margin-top: 1%" placeholder="Port" />' +
        '</div>' +
        '<div class="col-sm-6">' +
          '<button class="btn btn-success shadow-sm" style="width: 100%; margin-top: 1%">Change port</button>' +
        '</div>' +
      '</div>' +
      '<div class="row" style="width: 100%; margin-top: 1%">' +
        '<div class="col-sm-6">' +
          '<input type="text" class="form-control shadow-sm" style="width: 100%; margin-top: 1%" placeholder="Schema" />' +
        '</div>' +
        '<div class="col-sm-6">' +
          '<button class="btn btn-success shadow-sm" style="width: 100%; margin-top: 1%">Change schema name</button>' +
        '</div>' +
      '</div>' +
      '<hr />'
    );
  }

}
