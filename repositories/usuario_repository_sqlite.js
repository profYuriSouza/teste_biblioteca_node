const UsuarioRepository = require("./usuario_repository");
const Usuario = require("../models/usuario");

class UsuarioRepositorySQLite extends UsuarioRepository {
    constructor(banco) {
        super();
        this.banco = banco;
    }

    paraModelo(linha) {
        return linha ? new Usuario(linha.id, linha.nome, linha.email, linha.senha_hash) : null;
    }

    buscarPorId(id) {
        return this.paraModelo(this.banco.prepare("SELECT * FROM usuarios WHERE id = ?").get(id));
    }

    buscarPorEmail(email) {
        return this.paraModelo(this.banco.prepare("SELECT * FROM usuarios WHERE email = ?").get(email));
    }

    adicionar(usuario) {
        const resultado = this.banco.prepare(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)"
        ).run(usuario.nome, usuario.email, usuario.senhaHash);
        return this.buscarPorId(Number(resultado.lastInsertRowid));
    }

    atualizar(usuario) {
        this.banco.prepare("UPDATE usuarios SET nome = ?, email = ?, senha_hash = ? WHERE id = ?")
            .run(usuario.nome, usuario.email, usuario.senhaHash, usuario.id);
        return this.buscarPorId(usuario.id);
    }

    excluir(id) {
        return this.banco.prepare("DELETE FROM usuarios WHERE id = ?").run(id).changes > 0;
    }
}
module.exports = UsuarioRepositorySQLite;
