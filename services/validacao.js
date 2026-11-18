const ErroAplicacao = require("./erro_aplicacao");

function validarObjeto(dados) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
        throw new ErroAplicacao("Envie um objeto JSON válido.");
    }
}

function validarNome(nome) {
    if (typeof nome !== "string" || nome.trim().length < 3) {
        throw new ErroAplicacao("O nome deve ter pelo menos 3 caracteres.");
    }
}

function validarEmail(email) {
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new ErroAplicacao("Informe um e-mail válido.");
    }
}

function validarSenha(senha) {
    // bcrypt considera até 72 bytes. Evitamos aceitar senhas truncadas.
    if (typeof senha !== "string" || senha.length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
        throw new ErroAplicacao("A senha deve ter ao menos 8 caracteres e no máximo 72 bytes.");
    }
}

module.exports = { validarObjeto, validarNome, validarEmail, validarSenha };
