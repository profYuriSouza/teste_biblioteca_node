const Usuario = require("../models/usuario");
const ErroAplicacao = require("./erro_aplicacao");
const { validarObjeto, validarNome, validarEmail, validarSenha } = require("./validacao");
const { gerarHash } = require("../security/senhas");

class UsuarioService {
    constructor(repository, emprestimoRepository) {
        this.repository = repository;
        this.emprestimos = emprestimoRepository;
    }
    buscar(id) {
        const usuario = this.repository.buscarPorId(id);
        if (!usuario) throw new ErroAplicacao("Usuário não encontrado.", 404);
        return usuario;
    }
    criar(dados) {
        validarObjeto(dados);
        validarNome(dados.nome);
        validarEmail(dados.email);
        validarSenha(dados.senha);
        const email = dados.email.trim().toLowerCase();
        if (this.repository.buscarPorEmail(email)) {
            throw new ErroAplicacao("Este e-mail já está cadastrado.", 409);
        }
        // A senha recebida nunca é enviada ao Repository: só o hash é persistido.
        const usuario = new Usuario(null, dados.nome.trim(), email, gerarHash(dados.senha));
        return this.repository.adicionar(usuario);
    }
    atualizar(id, dados) {
        const atual = this.buscar(id);
        validarObjeto(dados);
        validarNome(dados.nome);
        validarEmail(dados.email);
        const email = dados.email.trim().toLowerCase();
        const outro = this.repository.buscarPorEmail(email);
        if (outro && outro.id !== id) throw new ErroAplicacao("Este e-mail já está cadastrado.", 409);
        let hash = atual.senhaHash;
        // Deixar a senha em branco conserva a senha anterior.
        if (dados.senha !== undefined && dados.senha !== "") {
            validarSenha(dados.senha);
            hash = gerarHash(dados.senha);
        }
        return this.repository.atualizar(new Usuario(id, dados.nome.trim(), email, hash));
    }
    excluir(id) {
        this.buscar(id);
        if (this.emprestimos.possuiHistoricoUsuario(id)) {
            throw new ErroAplicacao("A conta possui histórico de empréstimos e não pode ser excluída.", 409);
        }
        this.repository.excluir(id);
    }
}
module.exports = UsuarioService;
