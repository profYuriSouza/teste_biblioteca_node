-- Este arquivo cria as tabelas somente quando elas ainda não existem.
-- Por isso, reiniciar o servidor não apaga os dados cadastrados.
CREATE TABLE IF NOT EXISTS autores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    senha_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    ano INTEGER NOT NULL,
    isbn TEXT NOT NULL UNIQUE
);

-- Um livro pode ter vários autores e um autor pode escrever vários livros.
-- A chave composta impede que o mesmo autor seja associado duas vezes ao livro.
CREATE TABLE IF NOT EXISTS livros_autores (
    livro_id INTEGER NOT NULL,
    autor_id INTEGER NOT NULL,
    PRIMARY KEY (livro_id, autor_id),
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS emprestimos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    livro_id INTEGER NOT NULL,
    data_emprestimo TEXT NOT NULL,
    data_devolucao TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE RESTRICT
);

-- Nesta versão, cada livro cadastrado representa um exemplar.
-- Mesmo que duas requisições tentem emprestá-lo, apenas uma pode ficar ativa.
CREATE UNIQUE INDEX IF NOT EXISTS um_emprestimo_ativo_por_livro
ON emprestimos(livro_id) WHERE data_devolucao IS NULL;
