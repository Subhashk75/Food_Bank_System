// utils/auth.js
class Auth {
  static loggedIn() {
    return !!localStorage.getItem('token');
  }

  static login(token) {
    localStorage.setItem('token', token);
  }

  static logout() {
    localStorage.removeItem('token');
    window.location.assign('/');
  }

  static getToken() {
    return localStorage.getItem('token');
  }
}

export default Auth;