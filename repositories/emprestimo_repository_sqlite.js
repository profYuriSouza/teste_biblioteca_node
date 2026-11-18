const EmprestimoRepository = require("./emprestimo_repository");
const Emprestimo = require("../models/emprestimo");

class EmprestimoRepositorySQLite extends EmprestimoRepository {
    constructor(banco) {
        super();
        this.banco = banco;
    }

    paraModelo(linha) {
        return linha ? new Emprestimo(linha.id, linha.usuario_id, linha.livro_id,
            linha.titulo, linha.data_emprestimo, linha.data_devolucao) : null;
    }

    listarPorUsuario(usuarioId) {
        const linhas = this.banco.prepare(`
            SELECT e.*, l.titulo FROM emprestimos e
            JOIN livros l ON l.id = e.livro_id
            WHERE e.usuario_id = ? ORDER BY e.id DESC
        `).all(usuarioId);
        return linhas.map(linha => this.paraModelo(linha));
    }

    buscarPorId(id) {
        const linha = this.banco.prepare(`
            SELECT e.*, l.titulo FROM emprestimos e
            JOIN livros l ON l.id = e.livro_id WHERE e.id = ?
        `).get(id);
        return this.paraModelo(linha);
    }

    ativoPorLivro(livroId) {
        return !!this.banco.prepare(
            "SELECT 1 FROM emprestimos WHERE livro_id = ? AND data_devolucao IS NULL"
        ).get(livroId);
    }

    possuiHistoricoLivro(livroId) {
        return !!this.banco.prepare("SELECT 1 FROM emprestimos WHERE livro_id = ? LIMIT 1").get(livroId);
    }

    possuiHistoricoUsuario(usuarioId) {
        return !!this.banco.prepare("SELECT 1 FROM emprestimos WHERE usuario_id = ? LIMIT 1").get(usuarioId);
    }

    adicionar(usuarioId, livroId, data) {
        const resultado = this.banco.prepare(`
            INSERT INTO emprestimos (usuario_id, livro_id, data_emprestimo)
            VALUES (?, ?, ?)
        `).run(usuarioId, livroId, data);
        return this.buscarPorId(Number(resultado.lastInsertRowid));
    }

    devolver(id, data) {
        this.banco.prepare(
            "UPDATE emprestimos SET data_devolucao = ? WHERE id = ? AND data_devolucao IS NULL"
        ).run(data, id);
        return this.buscarPorId(id);
    }
}
module.exports = EmprestimoRepositorySQLite;
