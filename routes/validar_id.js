const ErroAplicacao = require("../services/erro_aplicacao");

function validarId(texto) {
    const id = Number(texto);
    if (!Number.isSafeInteger(id) || id <= 0 || !/^\d+$/.test(texto)) {
        throw new ErroAplicacao("ID inválido.");
    }
    return id;
}
module.exports = validarId;
