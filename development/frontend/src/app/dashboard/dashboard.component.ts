import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConnectorService } from '../connector.service';
import { SqlService } from '../sql.service';
import { FeatureService } from '../feature.service';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  //The table names that will be displayed
  tableNames = [];

  //The columnnames that will be displayed
  columnNames = [];
  //columnConfigNames = [];

  //The connectors loaded from the config file
  connectors: any = [];

  //The connector which is selected
  selectedConnector: any;

  //The important links from the config file
  importantLinks: any = ["Lukas", "Tobias", "Kathi", "Klaus"];

  showCols: boolean = false;
  showRenameTable: boolean = false;
  showRenameCol: boolean = false;

  tableSelect: boolean = false;
  idTableSelected: string = "";

  columnSelected: boolean = false;
  idColumnSelected: string = "";

  renameTableForm: FormGroup;
  tableNameSubmitted: boolean = false;

  renameColumnForm: FormGroup;
  columnNameSubmitted: boolean = false;

  sqlForm: FormGroup;
  sqlSubmitted: boolean = false;

  addImportantLinkFrom: FormGroup;
  addLinkSubmitted: boolean = false;

  sqlNotSucess: boolean = false;

  checkedTable:boolean = false;
  checkedColumn: boolean = false;

  errorField: boolean = false;

  geoColumn: string = "";
  idColumn: string = "";

  allTablesExcluded: boolean;
  allColumnsExcluded: boolean = false;

  constructor(  private formBuilder: FormBuilder, 
                private conService: ConnectorService, 
                private featureService: FeatureService, 
                private sqlService: SqlService,
                private homeSerivce: HomeService) { }

  

  async ngOnInit() {
    //Init the forms to rename the tables and columns and to execute the sql query
    this.sqlForm = this.formBuilder.group({
      collectionId: ['', Validators.required],
      sqlQuery: ['', Validators.required]
    });

    this.addImportantLinkFrom = this.formBuilder.group({
      addLink: ['', Validators.required],
      displayName: ['', Validators.required]
    });

    this.renameTableForm = this.formBuilder.group({
      tableName: ['', Validators.required]
    });

    this.renameColumnForm = this.formBuilder.group({
      columnName: ['', Validators.required]
    });

    this.importantLinks = await this.homeSerivce.getLinks();

    
    //Load all the connectors from the config
    this.connectors = await this.conService.getConnector();

    if(this.connectors.length == 0){
      this.connectors = [{id: "No Connectors"}];
    }

    var select = document.getElementById("selectField") as HTMLSelectElement;
    var index = select.selectedIndex;

    index == -1 ? index = 0 : index = index

    this.selectedConnector = this.connectors[index];
    //Load the table names from the selected connector
    this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id });

    
    //Event when another conneector in the dropdown is selected
    select.onchange = async (event: any)=>{
      var select = document.getElementById("selectField") as HTMLSelectElement;
      this.selectedConnector = this.connectors[select.selectedIndex];

      this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id });
      this.tableSelect = false;
    }

    //Check if all the tables are excluded
    for(let i = 0; i < this.tableNames.length; i++) {
      if(this.selectedConnector.config[this.tableNames[i]] == undefined) {
        this.allTablesExcluded = false;
        break;
      } else if(this.selectedConnector.config[this.tableNames[i]].exclude == undefined) {
        this.allTablesExcluded = false;
        break;
      } else if(this.selectedConnector.config[this.tableNames[i]].exclude == false) {
        this.allTablesExcluded = false;
        break;
      } else {
        this.allTablesExcluded = true;
      }
    }
  }



  /**
   * Handle the click event when a table row with table names is clicked
   *
   * @param name the name or the id of the table row that has been clicked
   */
  async onClickTableName(name: string) {
    // If a "tablename row" is already selected, then
    // you have to change the style
    if(this.tableSelect) {
      var change = document.getElementById(this.idTableSelected);
      change.style.backgroundColor = "white";
      change.style.color = "black";

      // If a "columnname row" is also selected
      // then you have to deselect is
      if(this.columnSelected) {
        var col = document.getElementById(this.idColumnSelected)
        col.style.backgroundColor = "white";
        col.style.color = "black";

        this.columnSelected = false;
        this.showRenameCol = false;
      }
    }

    // Change the style of the selected row
    // and save the id of it
    var row = document.getElementById(name);
    row.style.color = "white";
    row.style.backgroundColor = "#0069D9";
    this.showRenameTable = true;
    this.tableSelect = true;
    this.idTableSelected = name;
    this.showCols = true;

    this.columnNames = await this.conService.getColumn({'id': this.selectedConnector.id, 'table':''+name});
    
    if(this.selectedConnector.config[name] == undefined) {

    } else if(this.selectedConnector.config[name].geoCol == undefined) {

    } else {
      this.geoColumn = this.selectedConnector.config[name].geoCol
    }

    if(this.selectedConnector.config[name] == undefined) {

    } else if(this.selectedConnector.config[name].idCol == undefined) {
      this.idColumn = this.selectedConnector.config[name].idCol 
    }
    this.allColumnsExcluded = this.checkIfAllColumnExcluded();
  }

  /**
   * Handle the click event when a table row with columns is clicked
   *
   * @param name the name or id of the table row that has been clicked
   */
  onClickColumn(name: string) {
    // If a "columnname row" is already selected
    // it has to be deselected
    if(this.columnSelected) {
      var change = document.getElementById(this.idColumnSelected);
      change.style.backgroundColor = "white";
      change.style.color = "black";
    }

    // Change the style of the selected row
    // and save the id of it
    var row = document.getElementById(name);
    row.style.color = "white";
    row.style.backgroundColor = "#0069D9";
    this.showRenameCol = true;
    this.idColumnSelected = name;
    this.columnSelected = true;
  }

  /**
   * Handle the click event when the new table name is submitted
   */
  async submitTable() {
    this.tableNameSubmitted = true;
    if(this.renameTableForm.invalid) {
      return;
    }

    //Init the JSON for the backend
    var json = {
      'id': this.selectedConnector.id,
      'orgName': this.idTableSelected,
      'alias': this.renameTableForm.value.tableName
    };

    if(this.tableNames.includes(this.renameTableForm.value.tableName)) {
      var er = document.getElementById("infoField");
          er.style.marginTop = "2%";
          er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                        <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                            <p>
                                This name is already assigned to another table
                            </p>
                            </div>
                    </div>`;
          return;
    }

    //The unique names have to be on all of the databases
    for(let i = 0;  i < this.connectors.length; i++) {
      var con = this.connectors[i];
      var tab = await this.conService.getTables({'id': con.id });
      var er = document.getElementById("infoField");
      //The unique names have to be on all tables
      for(let j = 0; j < tab.length; j++) {
        if(con.config[tab[j]] == undefined) {

        } else if(con.config[tab[j]].alias == undefined) {

        } else if(con.config[tab[j]].alias == this.renameTableForm.value.tableName) {
          //Error Message
          er.style.marginTop = "2%";
          er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                        <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                            <p>
                                This name is already assigned to another table. Table: ${tab[j]}
                            </p>
                            </div>
                    </div>`;
          return;
        }
      }
    }

    this.conService.renameTable(json).then(
      async ()=>{
          //Info message
          er.style.marginTop = "2%";
          er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                        <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                            <p>
                                Table renamed successfull
                            </p>
                            </div>
                    </div>`;
        this.reload();
      }
    ).catch(()=>{
      //Error Message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                    <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                    <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                        <p>
                            Table not renamed
                        </p>
                        </div>
                </div>`;
    });
  }

  /**
   * Handle the click event when the new column name is submitted
   */
  async submitColumn() {
    this.columnNameSubmitted = true;
    if(this.renameColumnForm.invalid) {
      return;
    }

    //Init the JSON for the backend
    var json = {
      'id': this.selectedConnector.id,
      'table': this.idTableSelected,
      'alias': this.renameColumnForm.value.columnName,
      'orgName': this.idColumnSelected
    };

    var er = document.getElementById("infoField");
    if(this.columnNames.includes(this.renameColumnForm.value.columnName)) {
      //Error message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                          <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                            <p>This name is the original name of another column</p>
                          </div>
                        </div>
                      </div>`;
      return;
    }
    
    for(let i = 0; i < this.columnNames.length; i++) {
      if(this.selectedConnector.config[this.idTableSelected] == undefined) {

      } else if(this.selectedConnector.config[this.idTableSelected].map[this.columnNames[i]] == undefined) {

      } else if(this.selectedConnector.config[this.idTableSelected].map[this.columnNames[i]].alias == undefined) {

      } else if(this.selectedConnector.config[this.idTableSelected].map[this.columnNames[i]].alias == this.renameColumnForm.value.columnName) {
        //Error message
        er.style.marginTop = "2%";
        er.innerHTML = `<div class="card card-custom">
                          <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                            <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                              <p>This name is already assigned to a column: ${this.selectedConnector.config[this.idTableSelected].map[this.columnNames[i]].alias}</p>
                            </div>
                          </div>
                        </div>`;
        return;
      }
    }
    var er = document.getElementById("infoField");
    this.conService.renameColumn(json).then(async()=>{
      this.reload();
      this.columnNames = await this.conService.getColumn({'id': this.selectedConnector.id, 'table':''+this.idTableSelected});
      //Info message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                    <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                    <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                        <p>
                            Column renamed successfull
                        </p>
                        </div>
                </div>`;
    }).catch(()=>{
          //Error message
          er.style.marginTop = "2%";
          er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                        <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                            <p>
                                Column not renamed
                            </p>
                            </div>
                    </div>`;
    });

  }

  /**
   * Reload the connectors and tables
   */
  async reload() {
    this.connectors = await this.conService.getConnector();

    var select = document.getElementById("selectField") as HTMLSelectElement;
    this.selectedConnector = this.connectors[select.selectedIndex]

    this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id }); //{'id':'Inspire'}

  }

  /**
   * Reload and load the new tables
   */
  async loadNewTables() {
    var select = document.getElementById("selectField") as HTMLSelectElement;
    this.selectedConnector = this.connectors[select.selectedIndex]

    this.tableNames = await this.conService.getTables({'id': this.selectedConnector.id });
  }

  /**
   * Handle the "execute" event for the sql query
   */
  executeSQL() {
    this.sqlSubmitted = true;
    if(this.sqlForm.invalid) {
      return;
    }

    var json = {
      'id': this.selectedConnector.id,
      'sql': this.sqlForm.value.sqlQuery,
      'collectionName': this.sqlForm.value.collectionId,
      'check': false
    };
    
    var errorText = document.getElementById('sqlError');
    this.sqlService.executeSQL(json).then(
      async ()=>{
        //Show info message
        errorText.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                        <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                            <p>
                                SQL executed successfull
                            </p>
                            </div>
                    </div>`;
                    this.reload();
      }
    ).catch((err)=>{
      this.sqlNotSucess = true;      
      //Show error message
      errorText.innerHTML = `<div class="card card-custom">
                                <div class="card-header" style="background-color: #F56565; color: white">SQL ERROR</div>
                                  <div class="card-body" style="background-color: #FFF5F5; color: #CE303C">
                                    <p>${err.error}</p>
                                  </div>
                                </div>
                              </div>`;
    });

  }

  /**
   * Handle the "test SQL" button click event
   */
  testSQL() {
    this.sqlSubmitted = true;
    if(this.sqlForm.invalid) {
      return;
    }

    var json = {
      'id': this.selectedConnector.id,
      'sql': this.sqlForm.value.sqlQuery,
      'collectionName': this.sqlForm.value.collectionId,
      'check': false
    };
    
    var errorText = document.getElementById('sqlError');
    //Call the service
    this.sqlService.executeSQL(json).then(
      async ()=>{
        //Show infor message
        errorText.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #38B2AC; color: white">TEST INFORMATION</div>
                        <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                            <p>
                                SQL executed successfull
                            </p>
                            </div>
                    </div>`;
      }
    ).catch((err)=>{
      this.sqlNotSucess = true;      
      //Show error message
      errorText.innerHTML = `<div class="card card-custom">
                                <div class="card-header" style="background-color: #F56565; color: white">SQL TEST ERROR</div>
                                  <div class="card-body" style="background-color: #FFF5F5; color: #CE303C">
                                    <p>${err.error}</p>
                                  </div>
                                </div>
                              </div>`;
    });

  }

  /**
   * Handle the exclude event when the checkbox is changed in the tables
   */
  async excludeTable(tableName: string) {
    var cb = document.getElementById("checkbox-" + tableName) as HTMLInputElement;
    var checked: boolean = cb.checked;
    var bool: boolean = false;
    if(checked) {
      bool = true;
    } else {
      bool = false;
    }
    var json = {
      'id': this.selectedConnector.id,
      'table': tableName,
      'exclude': bool
    };

    //Call the service
    await this.conService.excludeTable(json);
    //Check if all the tables are excluded
    this.allTablesExcluded = this.areAllTableExcludedCheckbox();
  }

  /**
   * Exclude a column
   * 
   * @param colName then name of the column that should be excluded
   */
  excludeColumn(colName: string) {
    var cb = document.getElementById("checkbox-" + colName) as HTMLInputElement;
    var checked: boolean = cb.checked;
    var bool: boolean = false;
    var er = document.getElementById("infoField");
    if(colName == this.geoColumn) {
      //Show error message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                          <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                            <p>${colName} cant be excluded as it is the GEO Column</p>
                          </div>
                        </div>
                      </div>`;
      return;
    }

    if(colName == this.idColumn) {
      //Show error message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                          <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                            <p>${colName} cant be excluded as it is the ID Column</p>
                          </div>
                        </div>
                      </div>`;
      return;
    }
    if(checked) {
      bool = true;
    } else {
      bool = false;
    }
    var json = {
      'id': this.selectedConnector.id,
      'table': this.idTableSelected,
      'column': colName,
      'exclude': bool
    };
    //Call the service to exclude the column
    this.conService.excludeColumn(json);
    //Check if all the columns are excluded
    this.allColumnsExcluded = this.checkIfAllColumnExcludedCheckbox();
  }


  /**
   * Handle the click event when a column should be used as ID
   */
  async useAsId()  {
    var checkbox = document.getElementById("useAsId") as HTMLInputElement;
    var checked:boolean = checkbox.checked;
    var setTo: boolean;
    var json;
    if(checked) {
      setTo = false;
      json = {
        'id': this.selectedConnector.id,
        'table': this.idTableSelected,
        'column': this.idColumnSelected
      }
      
    } else {
      setTo = true;
      json = {
        'id': this.selectedConnector.id,
        'table': this.idTableSelected,
        'column': null
      }
    }
    
    this.idColumn = this.idColumnSelected;
    var er = document.getElementById("infoField");
    this.featureService.setAsId(json).then(()=>{
      //Show info message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                    <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                    <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                        <p>
                           ${this.idColumnSelected} is now the ID column
                        </p>
                        </div>
                </div>`;
      }).catch((err)=>{
        //Show error message
        er.style.marginTop = "2%";
        er.innerHTML = `<div class="card card-custom">
                      <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                      <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                          <p>
                              Not selected as ID column
                          </p>
                          </div>
                  </div>`;
    });
  }

  /**
   * Handle the click event when a column should be used as geometry
   */
  useAsGeometry() {
    var checkbox = document.getElementById("useAsGeometry") as HTMLInputElement;
    var checked:boolean = checkbox.checked;
    var setTo: boolean;
    var json;
    if(checked) {
      setTo = false;
      json = {
        'id': this.selectedConnector.id,
        'table': this.idTableSelected,
        'column': this.idColumnSelected
      }
      
    } else {
      setTo = true;
      json = {
        'id': this.selectedConnector.id,
        'table': this.idTableSelected,
        'column': null
      }
      
      
    }
    var er = document.getElementById("infoField");
    this.geoColumn = this.idColumnSelected;
    this.featureService.setAsGeometry(json).then(()=>{
      //Show info message if the service call was successfull
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                    <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                    <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                        <p>
                           ${this.idColumnSelected} is now the GEO column
                        </p>
                        </div>
                </div>`;
    }).catch(()=>{
      //Show an error message if the call wasnt successfull
        er.style.marginTop = "2%";
        er.innerHTML = `<div class="card card-custom">
                      <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                      <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                          <p>
                              Not selected as GEO column
                          </p>
                          </div>
                  </div>`;
    });
  }

  /**
   * Handle the click event when all tables should be included or excluded
   */
  async excludeAllTables() {
    var tables:any = document.getElementsByClassName("excludeTable");
    var exlcudeAll:any = document.getElementById("exludeAllTables");
    var exclude: Boolean;
    if(exlcudeAll.checked) {
      // After clicking the checkbox is checked
      // so all og the tables will be exluded
      exclude = true;
      for(var i = 0; i < tables.length; i++) {
        tables[i].checked = "checked";
      }
      this.allTablesExcluded = true;
    } else {
      // After clicking the checkbox is not checked
      // so all of the tables will be included
      exclude = false;
      for(var i = 0; i < tables.length; i++) {
        tables[i].checked = false;
      }
      this.allTablesExcluded = false;
    }
    var json = {
      'id': this.selectedConnector.id,
      'exclude': exclude
    };

    this.conService.excludeAllTables(json);
  }

  /**
   * Handle the click event when all the columns should be included or excluded
   */
  excludeAllColumns() {
    var columns:any = document.getElementsByClassName("excludeColumn");
    var but:any = document.getElementById("excludeAllColumns")
    var exclude: Boolean;
    if(but.checked) {
      exclude = true;
      for(var i = 0; i < columns.length; i++) {
        columns[i].checked = "checked";
      }
      this.allColumnsExcluded = true;
    } else {
      exclude = false;
      for(var i = 0; i < columns.length; i++) {
        columns[i].checked = false;
      }
      this.allColumnsExcluded = false;
    }

    var json = {
      'id': this.selectedConnector.id,
      'table': this.idTableSelected,
      'exclude': exclude
    };
    this.conService.excludeAllColumns(json);

  }

  addImportantLink() {
    this.addLinkSubmitted = true;
    if(this.addImportantLinkFrom.invalid) {
      return;
    }        
    var er = document.getElementById("infoLinkField");
    for(let i = 0; i < this.importantLinks.length; i++) {
      if(this.addImportantLinkFrom.value.displayName == this.importantLinks[i].name) {
        //Show error message
        er.style.marginTop = "2%";
        er.innerHTML = `<div class="card card-custom">
                          <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                            <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                              <p>A link with this name already exists</p>
                            </div>
                          </div>
                        </div>`;
        return;
      } else if (this.addImportantLinkFrom.value.addLink == this.importantLinks[i].link) {
        //Show error message
        er.style.marginTop = "2%";
        er.innerHTML = `<div class="card card-custom">
                          <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                            <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                              <p>This link already exists</p>
                            </div>
                          </div>
                        </div>`;
        return;
      }
    }
    
    var json = {
      'link': this.addImportantLinkFrom.value.addLink,
      'name': this.addImportantLinkFrom.value.displayName
    };
    var er = document.getElementById("infoLinkField");
    this.homeSerivce.addLink(json).then( async ()=>{
      //Show info message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                          <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                            <p>Added as important link</p>
                          </div>
                        </div>
                      </div>`;
      this.importantLinks = await this.homeSerivce.getLinks();

    }).catch((err)=>{
      //Show error message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                        <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                          <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                        <p>
                            Not added as important link
                        </p>
                        </div>
                </div>`;
    });
  }

  /**
   * Check if all the tales are excluded by checking if the checkboxes are checked
   */
  areAllTableExcludedCheckbox(): boolean {
    for(let i = 0; i < this.tableNames.length; i++) {
      var check = document.getElementById("checkbox-" + this.tableNames[i]) as HTMLInputElement;
      if(check.checked == false) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if all the columns are excluded by checking the config
   */
  checkIfAllColumnExcluded():boolean {
    for(let i = 0; i< this.columnNames.length; i++) {
      if(this.selectedConnector.config[this.idTableSelected] == undefined) {
        return false;
      } else if(this.selectedConnector.config[this.idTableSelected].map[this.columnNames[i]] == undefined) {
        return false;
      } else if(this.selectedConnector.config[this.idTableSelected].map[this.columnNames[i]].exclude == undefined)  {
        return false;
      } else if(this.selectedConnector.config[this.idTableSelected].map[this.columnNames[i]].exclude == false) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if all the columns are exclueded by checking if the checkboxes are checked
   */
  checkIfAllColumnExcludedCheckbox():boolean {
    for(let i = 0; i < this.columnNames.length; i++) {
      var check = document.getElementById("checkbox-" + this.columnNames[i]) as HTMLInputElement;
      if(check.checked == false) {
        return false;
      }
    }
    return true;
  }


  /**
   * Handle the delete event for an important link
   * 
   * @param name the name of the important link that should be removed
   */
  removeImortantLink(name:string) {
    var json = {
      "name": name
    };
    var er = document.getElementById("infoLinkField");
    this.homeSerivce.removeLink(json).then(async ()=>{
      //Show info message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                    <div class="card-header" style="background-color: #38B2AC; color: white">INFORMATION</div>
                    <div class="card-body" style="background-color: #E6FFFA; color: #234E52">
                        <p>
                        Imortant link successfully removed
                        </p>
                        </div>
                </div>`;
          this.importantLinks = await this.homeSerivce.getLinks();
    }, (err)=>{
      //Show the error message
      er.style.marginTop = "2%";
      er.innerHTML = `<div class="card card-custom">
                    <div class="card-header" style="background-color: #F56565; color: white">ERROR</div>
                    <div class="card-body" style="background-color: #FFF5F5; color: ##355376">
                        <p>
                            Link not removed
                        </p>
                        </div>
                </div>`;
    });
  }

 

}
 