class Emprestimo {
    constructor(id, usuarioId, livroId, titulo, dataEmprestimo, dataDevolucao) {
        this.id = id;
        this.usuario_id = usuarioId;
        this.livro_id = livroId;
        this.titulo = titulo;
        this.data_emprestimo = dataEmprestimo;
        this.data_devolucao = dataDevolucao;
    }

    toDict() {
        return {
            id: this.id, usuario_id: this.usuario_id, livro_id: this.livro_id,
            titulo: this.titulo, data_emprestimo: this.data_emprestimo,
            data_devolucao: this.data_devolucao
        };
    }
}
module.exports = Emprestimo;
