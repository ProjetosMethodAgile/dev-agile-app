const jwt = require("jsonwebtoken");

async function checkTokenLogin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado", error: true });
  }

  try {
    const secret = process.env.SECRET_LOGIN;
    const decoded = jwt.verify(token, secret);
    // O token contém, por exemplo:
    // {
    //   "id": "a81aec...",
    //   "empresa": { "id": "69d75463...", "tag": "teste" },
    //   "iat": ...,
    //   "exp": ...
    // }
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(400).json({ message: "Token inválido", error: true });
  }
}

module.exports = checkTokenLogin;
