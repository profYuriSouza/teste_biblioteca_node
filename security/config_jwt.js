const jwt = require("jsonwebtoken");

// server.js carrega o .env antes de importar este arquivo.
const segredo = process.env.JWT_SECRET;
if (!segredo || segredo.length < 32) {
    throw new Error("Configure JWT_SECRET no .env com pelo menos 32 caracteres.");
}

function gerarToken(usuarioId) {
    // sub identifica o usuário. O token NÃO contém senha nem hash de senha.
    return jwt.sign({}, segredo, {
        subject: String(usuarioId), expiresIn: "8h", algorithm: "HS256"
    });
}

function verificarToken(token) {
    // verify confere assinatura e prazo; decode sozinho não autentica o token.
    return jwt.verify(token, segredo, { algorithms: ["HS256"] });
}

module.exports = { gerarToken, verificarToken };
