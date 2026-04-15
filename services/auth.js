const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '699350318798-o5lftckmjckrqrb9k79p6eucvk2fkn65.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

class AuthService {
  async verifyToken(idToken) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
      };
    } catch (err) {
      throw new Error('Invalid ID Token: ' + err.message);
    }
  }

  async checkClassroom(email) {
    const gasUrl = `https://script.google.com/macros/s/AKfycbxZeh8qsuTZqe4tUZuE3U25SVCiclielj-RuwzTj3Qe4fgVnimAASSC1YMRpYYUqQPG/exec?email=${encodeURIComponent(email)}`;
    const res = await fetch(gasUrl);
    const data = await res.json();
    return data.allowed;
  }
}

module.exports = AuthService;