const path = require("path");
// Carrega PORT e JWT_SECRET antes dos arquivos que usam essas variáveis.
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const banco = require("./database/conexao");

const AutorRepository = require("./repositories/autor_repository_sqlite");
const LivroRepository = require("./repositories/livro_repository_sqlite");
const UsuarioRepository = require("./repositories/usuario_repository_sqlite");
const EmprestimoRepository = require("./repositories/emprestimo_repository_sqlite");
const AutorService = require("./services/autor_services");
const LivroService = require("./services/livro_services");
const UsuarioService = require("./services/usuario_services");
const EmprestimoService = require("./services/emprestimo_services");
const AuthService = require("./services/auth_services");
const criarAutenticacao = require("./security/middleware_auth");
const criarRotasAutor = require("./routes/autor_routes");
const criarRotasLivro = require("./routes/livro_routes");
const criarRotasUsuario = require("./routes/usuario_routes");
const criarRotasEmprestimo = require("./routes/emprestimo_routes");
const criarRotasAuth = require("./routes/auth_routes");

function criarApp() {
    const app = express();
    app.use(express.json()); // transforma o JSON recebido em req.body

    // Instanciamos as dependências uma vez e as entregamos aos Services.
    const autores = new AutorRepository(banco);
    const livros = new LivroRepository(banco);
    const usuarios = new UsuarioRepository(banco);
    const emprestimos = new EmprestimoRepository(banco);
    const autenticar = criarAutenticacao(usuarios);

    app.use("/api/autores", criarRotasAutor(new AutorService(autores), autenticar));
    app.use("/api/livros", criarRotasLivro(new LivroService(livros, autores, emprestimos), autenticar));
    app.use("/api/usuarios", criarRotasUsuario(new UsuarioService(usuarios, emprestimos), autenticar));
    app.use("/api/emprestimos", criarRotasEmprestimo(new EmprestimoService(emprestimos, livros), autenticar));
    app.use("/api/auth", criarRotasAuth(new AuthService(usuarios)));
    app.use("/api", (req, res) => res.status(404).json({ erro: "Rota da API não encontrada." }));

    // Front-end: o Express entrega HTML, CSS e JS como arquivos estáticos.
    // O navegador executa public/js/*.js, que usa fetch para chamar /api/...
    // Aqui não existe Jinja nem outro mecanismo de templates.
    app.use(express.static(path.join(__dirname, "public")));

    // Express 5 encaminha erros lançados pelas rotas até este middleware.
    app.use((erro, req, res, next) => {
        if (erro.type === "entity.parse.failed") return res.status(400).json({ erro: "JSON inválido." });
        if (erro.status && erro.status >= 400 && erro.status < 500) {
            return res.status(erro.status).json({ erro: erro.message });
        }
        // A restrição no banco também protege contra requisições simultâneas.
        if (String(erro.message).includes("UNIQUE constraint failed")) {
            return res.status(409).json({ erro: "Registro duplicado ou livro já emprestado." });
        }
        console.error(erro);
        return res.status(500).json({ erro: "Erro interno no servidor." });
    });
    return app;
}

if (require.main === module) {
    const porta = Number(process.env.PORT) || 5000;
    criarApp().listen(porta, () => {
        console.log(`Biblioteca disponível em http://localhost:${porta}`);
    });
}
module.exports = criarApp;
