import { Injectable, ɵgetLocalePluralCase } from '@angular/core';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fireauth : AngularFireAuth, private router : Router) { }

  //login method
  login(email : string, password : string){
    this.fireauth.signInWithEmailAndPassword(email,password).then( res => {
      localStorage.setItem('token', 'true');

      if(res.user?.emailVerified == true){
        this.router.navigate(['lista-tarefas']);
      } else {
        this.router.navigate(['/verify-email']);
      }

    }, err => {
      alert(err.message);
      this.router.navigate(['/login']);
    })
  }

  //register method
  register(email : string, password : string){
    this.fireauth.createUserWithEmailAndPassword(email, password).then(  res => {
      alert('Registration Successful');
      this.sendEmailForVerification(res.user);
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
      this.router.navigate(['/register']);
    })
  }

  //sign out method
  logout(){
    this.fireauth.signOut().then( () => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
    })
  }

  //forgot password
  forgotPassword(email : string){
    this.fireauth.sendPasswordResetEmail(email).then( () => {
      this.router.navigate(['/verify-email']);
    }, err => {
      alert('Something went wrong');
    })
  }

  //email verification
  sendEmailForVerification(user : any) {
    console.log(user);
    user.sendEmailVerification().then((res : any) => {
      this.router.navigate(['/verify-email']);
    }, (err : any) => {
      alert('Something went wrong. Not able to send mail to your email.')
    })
  }

  //sign in with google
  googleSignIn() {
    return this.fireauth.signInWithPopup(new GoogleAuthProvider).then(res => {

      this.router.navigate(['/lista-tarefas']);
      localStorage.setItem('token',JSON.stringify(res.user?.uid));

    }, err => {
      alert(err.message);
    })
  }

}
