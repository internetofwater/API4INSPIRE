/*
 * Created on Wed Feb 26 2020
 *
 * Copyright (c) 2020 - Lukas Gäbler
 */
import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { async } from '@angular/core/testing';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted: boolean = false;
  success: boolean = false;

  loginNotSuccessful: boolean = false;


  constructor(private formBuilder: FormBuilder,public authservice: AuthService, private router: Router) { }

  ngOnInit() {
    //Init the login form
    this.loginForm = this.formBuilder.group({
      uname: ['', Validators.required],
      pwd: ['', Validators.required]
    });
  }

  /**
   * Handle the submit event when the user logs in and submits
   */
  login() {
    this.submitted = true;
    this.authservice.login(this.loginForm.value.uname,this.loginForm.value.pwd).then(
      async ()=>{
        this.loginNotSuccessful = false;
      }
    ).catch(()=>{
      this.loginNotSuccessful = true;
    });

  }

}
