const AuthService = require('../../services/auth');

module.exports = async function handler(req, res) {
  const idToken = req.body.credential || req.body.idtoken || req.query.idtoken;

  if (!idToken) {
    return res.status(400).json({ error: 'ID Token is required' });
  }

  try {
    const auth = new AuthService();
    const userData = await auth.verifyToken(idToken);
    const isAllowed = await auth.checkClassroom(userData.email);

    if (isAllowed) {
      res.status(200).json({
        status: 'success',
        user: userData
      });
    } else {
      res.status(403).json({ error: 'クラスルームのメンバー以外は利用できません。' });
    }

  } catch (err) {
    res.status(501).json({ error: err.message });
  }
};