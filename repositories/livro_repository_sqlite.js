const LivroRepository = require("./livro_repository");
const Livro = require("../models/livro");
const Autor = require("../models/autor");

class LivroRepositorySQLite extends LivroRepository {
    constructor(banco) {
        super();
        this.banco = banco;
    }

    paraModelo(linha) {
        if (!linha) return null;
        // JOIN recupera os autores cadastrados que estão ligados a este livro.
        const linhas = this.banco.prepare(`
            SELECT a.id, a.nome, a.email FROM autores a
            JOIN livros_autores la ON la.autor_id = a.id
            WHERE la.livro_id = ? ORDER BY a.nome
        `).all(linha.id);
        const autores = linhas.map(a => new Autor(a.id, a.nome, a.email));
        return new Livro(linha.id, linha.titulo, linha.ano, linha.isbn,
            autores, Boolean(linha.disponivel));
    }

    listar() {
        // NOT EXISTS informa se há algum empréstimo sem data de devolução.
        const linhas = this.banco.prepare(`
            SELECT l.*, NOT EXISTS (
                SELECT 1 FROM emprestimos e
                WHERE e.livro_id = l.id AND e.data_devolucao IS NULL
            ) AS disponivel
            FROM livros l ORDER BY l.titulo
        `).all();
        return linhas.map(linha => this.paraModelo(linha));
    }

    buscarPorId(id) {
        const linha = this.banco.prepare(`
            SELECT l.*, NOT EXISTS (
                SELECT 1 FROM emprestimos e
                WHERE e.livro_id = l.id AND e.data_devolucao IS NULL
            ) AS disponivel
            FROM livros l WHERE l.id = ?
        `).get(id);
        return this.paraModelo(linha);
    }

    buscarPorIsbn(isbn) {
        const linha = this.banco.prepare("SELECT id FROM livros WHERE isbn = ?").get(isbn);
        return linha ? this.buscarPorId(linha.id) : null;
    }

    adicionar(livro, autoresIds) {
        // Livro e relações devem ser gravados juntos. Se algo falhar, ROLLBACK
        // desfaz a operação inteira e evita livro sem autores por gravação parcial.
        this.banco.exec("BEGIN");
        try {
            const resultado = this.banco.prepare(
                "INSERT INTO livros (titulo, ano, isbn) VALUES (?, ?, ?)"
            ).run(livro.titulo, livro.ano, livro.isbn);
            const id = Number(resultado.lastInsertRowid);
            const associar = this.banco.prepare(
                "INSERT INTO livros_autores (livro_id, autor_id) VALUES (?, ?)"
            );
            for (const autorId of autoresIds) associar.run(id, autorId);
            this.banco.exec("COMMIT");
            return this.buscarPorId(id);
        } catch (erro) {
            this.banco.exec("ROLLBACK");
            throw erro;
        }
    }

    atualizar(livro, autoresIds) {
        this.banco.exec("BEGIN");
        try {
            this.banco.prepare("UPDATE livros SET titulo = ?, ano = ?, isbn = ? WHERE id = ?")
                .run(livro.titulo, livro.ano, livro.isbn, livro.id);
            // Substituímos as associações antigas pelas escolhidas no formulário.
            this.banco.prepare("DELETE FROM livros_autores WHERE livro_id = ?").run(livro.id);
            const associar = this.banco.prepare(
                "INSERT INTO livros_autores (livro_id, autor_id) VALUES (?, ?)"
            );
            for (const autorId of autoresIds) associar.run(livro.id, autorId);
            this.banco.exec("COMMIT");
            return this.buscarPorId(livro.id);
        } catch (erro) {
            this.banco.exec("ROLLBACK");
            throw erro;
        }
    }

    excluir(id) {
        return this.banco.prepare("DELETE FROM livros WHERE id = ?").run(id).changes > 0;
    }
}
module.exports = LivroRepositorySQLite;
