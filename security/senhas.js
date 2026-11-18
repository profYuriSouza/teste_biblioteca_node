const bcrypt = require("bcryptjs");

// O hash não é criptografia reversível. A verificação compara a senha informada
// com o hash armazenado; o bcrypt já inclui um salt em cada hash gerado.
function gerarHash(senha) {
    return bcrypt.hashSync(senha, 10);
}

function verificarSenha(senha, hash) {
    return bcrypt.compareSync(senha, hash);
}

module.exports = { gerarHash, verificarSenha };
