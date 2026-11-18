// Carga inicial para a demonstração. Não apaga nem substitui dados existentes.
// Execute: npm run seed
const banco = require("./database/conexao");
const { gerarHash } = require("./security/senhas");

const tabelas = ["autores", "usuarios", "livros", "emprestimos"];
const possuiDados = tabelas.some(tabela =>
    banco.prepare(`SELECT COUNT(*) AS total FROM ${tabela}`).get().total > 0
);

if (possuiDados) {
    console.log("O banco já contém dados. Seed não executado para preservar os registros.");
    banco.close();
} else {
    banco.exec("BEGIN");
    try {
        // Alguns nomes e títulos foram reaproveitados do projeto recebido.
        const addAutor = banco.prepare("INSERT INTO autores (nome, email) VALUES (?, ?)");
        const ana = Number(addAutor.run("Ana Martins", "ana.martins@exemplo.com").lastInsertRowid);
        const bruno = Number(addAutor.run("Bruno Ribeiro", "bruno.ribeiro@exemplo.com").lastInsertRowid);
        const carla = Number(addAutor.run("Carla Nogueira", "carla.nogueira@exemplo.com").lastInsertRowid);

        const addLivro = banco.prepare("INSERT INTO livros (titulo, ano, isbn) VALUES (?, ?, ?)");
        const livro1 = Number(addLivro.run("Algoritmos para Iniciantes", 2021, "9786501234014").lastInsertRowid);
        const livro2 = Number(addLivro.run("Estruturas de Dados na Prática", 2022, "9786501234021").lastInsertRowid);
        const livro3 = Number(addLivro.run("Introdução a Bancos de Dados", 2020, "9786501234038").lastInsertRowid);
        const livro4 = Number(addLivro.run("Desenvolvimento Web com JavaScript", 2023, "9786501234045").lastInsertRowid);
        const associar = banco.prepare("INSERT INTO livros_autores (livro_id, autor_id) VALUES (?, ?)");
        associar.run(livro1, ana);
        associar.run(livro2, bruno);
        associar.run(livro3, carla);
        associar.run(livro4, ana);
        associar.run(livro4, bruno); // exemplo de livro com dois autores

        // Conta SOMENTE para aula local. Observe que o banco recebe o hash.
        banco.prepare("INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)")
            .run("Leitor de Exemplo", "leitor@biblioteca.com", gerarHash("12345678"));
        banco.exec("COMMIT");
        console.log("Seed concluído: 3 autores, 4 livros e 1 usuário de exemplo.");
        console.log("Login de demonstração: leitor@biblioteca.com / 12345678");
    } catch (erro) {
        banco.exec("ROLLBACK");
        console.error("Não foi possível executar o seed:", erro.message);
        process.exitCode = 1;
    } finally {
        banco.close();
    }
}
