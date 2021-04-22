import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService implements CanActivate{

  constructor(private router: Router) 
  { }

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) : boolean 
{
  var isLoggedIn = false;
  if (sessionStorage.getItem("isLoggedIn") === "true")
  {  
    isLoggedIn = true;
    this.router.navigate(["/dashboard"]);
     
  }  else {
    isLoggedIn = false;
    this.router.navigate(["/login"]); 
  }
  return  isLoggedIn;
}
}
