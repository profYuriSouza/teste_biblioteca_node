const ErroAplicacao = require("./erro_aplicacao");
const { validarObjeto } = require("./validacao");
const { verificarSenha } = require("../security/senhas");
const { gerarToken } = require("../security/config_jwt");

class AuthService {
    constructor(usuarioRepository) { this.usuarios = usuarioRepository; }

    login(dados) {
        validarObjeto(dados);
        if (typeof dados.email !== "string" || typeof dados.senha !== "string" ||
            Buffer.byteLength(dados.senha, "utf8") > 72) {
            throw new ErroAplicacao("E-mail ou senha inválidos.", 401);
        }
        const usuario = this.usuarios.buscarPorEmail(dados.email.trim().toLowerCase());
        if (!usuario || !verificarSenha(dados.senha, usuario.senhaHash)) {
            throw new ErroAplicacao("E-mail ou senha inválidos.", 401);
        }
        return { token: gerarToken(usuario.id), usuario: usuario.toDict() };
    }
}
module.exports = AuthService;
