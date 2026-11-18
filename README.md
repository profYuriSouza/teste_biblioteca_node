# Biblioteca completa — Node.js, Express e SQLite

Projeto didático de uma biblioteca com **front-end e back-end**. A interface usa HTML, CSS e JavaScript puro. O servidor usa Node.js, Express, SQLite, bcrypt e JWT.

O projeto parte da organização do material anterior: `models`, `repositories`, `services`, `routes` e `security`. Agora os repositories realmente acessam o SQLite, o cadastro de usuário armazena o hash da senha e as rotas de escrita usam autenticação.

## 1. Como executar no VS Code

**Requisito:** Node.js 24 ou mais recente é a opção recomendada. Também é possível usar a linha 22 a partir da versão 22.13. O SQLite é acessado com `node:sqlite`, que já acompanha o Node dessas versões; não é necessário instalar outro pacote SQLite. Dependendo da versão do Node, pode aparecer um aviso de que esse módulo é experimental.

1. Extraia o ZIP e abra a pasta `Biblioteca_Node_SQLite_Completa` no VS Code.
2. Abra **Terminal → Novo Terminal**. Confirme que ele está na pasta onde está o `package.json`.
3. Execute, uma linha por vez:

```bash
npm install
npm run seed
npm start
```

4. Acesse **http://localhost:5000** no navegador.

Na primeira execução, o seed cria três autores, quatro livros e um usuário de demonstração. Use:

- **E-mail:** `leitor@biblioteca.com`
- **Senha:** `12345678`

A senha acima é apenas um exemplo para aula. O banco armazena o **hash**, não essa senha em texto puro. O livro “Desenvolvimento Web com JavaScript” já tem dois autores, para mostrar o relacionamento.

Depois da primeira instalação e carga, basta executar `npm start` para abrir novamente. Para parar o servidor, use `Ctrl + C` no terminal. Se não souber a versão instalada, execute `node -v`.

### Seed e banco existente

- O arquivo `dados/biblioteca.sqlite` é criado quando o programa acessa o banco. O `database/schema.sql` cria tabelas ausentes, sem apagar os registros.
- `npm run seed` popula o banco **somente se todas as tabelas de dados estiverem vazias**. Se já houver registros, ele avisa e não altera os dados.
- Para reiniciar completamente a demonstração, pare o servidor, exclua `dados/biblioteca.sqlite` pelo VS Code e execute novamente `npm run seed`. **Isso apaga todos os dados daquele banco.**
- Esta versão tem um esquema novo para relacionar livros e autores e armazenar hash de senha. Ela **não migra** o banco ou os JSONs do pacote anterior. Use o banco novo gerado por este projeto.

## 2. O que o sistema faz

- Consulta pública de livros e autores, com busca na tela do catálogo.
- Cadastro de usuário, login e saída; edição e exclusão da própria conta.
- Cadastro, edição e exclusão de autores e livros por usuários autenticados.
- Um livro deve ter **um ou mais autores**. Um autor pode estar ligado a vários livros.
- Um usuário pode ter **vários empréstimos**. Cada livro cadastrado representa um exemplar e só pode ter **um empréstimo ativo por vez**.
- A pessoa autenticada consulta e devolve somente seus próprios empréstimos. A devolução fica registrada no histórico.
- Autores vinculados a livros não podem ser excluídos. Livros e contas com histórico de empréstimo também não podem ser excluídos.

O sistema foi simplificado para a aula: qualquer conta autenticada pode cadastrar, alterar ou excluir livros e autores; não existem perfis de administrador. O ISBN é armazenado como texto para preservar eventuais zeros à esquerda. A validação exige 10 ou 13 dígitos, mas não calcula o dígito verificador.

## 3. Organização das pastas

| Pasta / arquivo | Responsabilidade |
| --- | --- |
| `server.js` | Cria o Express, conecta as camadas, registra as rotas e entrega a pasta `public`. |
| `public/index.html` | Estrutura da interface que chega ao navegador. |
| `public/css/estilo.css` | Aparência e adaptação para telas menores. |
| `public/js/api.js` | Usa `fetch`, envia JSON e inclui o token nas requisições. |
| `public/js/app.js` | Trata cliques, formulários, navegação e atualização da página. |
| `routes/` | Recebe as requisições HTTP e chama os Services. |
| `services/` | Valida dados e aplica regras de negócio. |
| `repositories/` | Define contratos didáticos e implementações de acesso ao SQLite. |
| `models/` | Representa autor, livro, usuário e empréstimo; `toDict()` prepara dados para a resposta. |
| `security/` | Gera e verifica hash e JWT; o middleware protege as rotas. |
| `database/schema.sql` | Declara tabelas, chaves estrangeiras e índice de empréstimo ativo. |
| `database/conexao.js` | Abre o arquivo SQLite e prepara as tabelas. |
| `seed.js` | Insere dados iniciais quando o banco está vazio. |
| `.env` | Define a porta e a chave usada para assinar os tokens nesta cópia local. |
| `requisicoes.http` | Exemplos opcionais para a extensão REST Client do VS Code. |
| `ROTEIRO_AULA.md` | Caminho sugerido para apresentar a aplicação e o código. |

JavaScript não possui uma palavra-chave nativa `abstract`. As classes `*_repository.js` **simulam** um contrato abstrato: não devem ser instanciadas diretamente e indicam quais métodos as classes `*_repository_sqlite.js` precisam implementar. Há apenas uma implementação concreta: SQLite.

## 4. Como o front-end se comunica com o back-end

Não há Flask, Jinja, Jade, Pug ou outro mecanismo de templates nesta versão.

1. O navegador solicita `http://localhost:5000/`.
2. Em `server.js`, `express.static(...)` entrega `public/index.html`, o CSS e os arquivos JavaScript.
3. O navegador executa `public/js/app.js`. Quando precisa de dados, ele chama `requisicao(...)` em `public/js/api.js`.
4. Essa função usa `fetch('/api/...')`. O Express recebe a requisição e a encaminha para uma rota.
5. A rota chama um Service; o Service valida os dados e chama um Repository; o Repository consulta ou modifica o SQLite.
6. A API responde em JSON. O JavaScript do navegador lê a resposta e atualiza a página com elementos HTML.

O **JSON é o formato das mensagens HTTP**, e `package.json` descreve o projeto Node. Nenhum arquivo JSON é usado para persistir os dados da biblioteca.

### Exemplo: emprestar um livro

- Em `public/js/app.js`, o botão envia `POST /api/emprestimos` com `{ "livro_id": 1 }`.
- Em `public/js/api.js`, o token é acrescentado ao cabeçalho `Authorization: Bearer ...`.
- `security/middleware_auth.js` verifica assinatura e validade do token e coloca o ID autenticado em `req.usuarioId`.
- `routes/emprestimo_routes.js` envia esse ID e o livro ao `EmprestimoService`.
- O Service verifica se o livro existe e está disponível. O Repository registra o empréstimo no banco.
- O navegador recebe a resposta e atualiza a disponibilidade no catálogo.

O servidor obtém o usuário pelo token validado, não por um `usuario_id` enviado no corpo. Os registros de empréstimo são filtrados pelo usuário autenticado.

## 5. Cadastro, hash e token

1. `POST /api/usuarios` recebe nome, e-mail e senha.
2. `UsuarioService` valida os dados e chama `gerarHash()` em `security/senhas.js`.
3. O bcrypt gera um hash com salt, e `UsuarioRepositorySQLite` armazena esse hash.
4. Em `POST /api/auth/login`, `AuthService` procura o e-mail e usa `verificarSenha()` para comparar a senha informada com o hash.
5. Se os dados estiverem corretos, `security/config_jwt.js` assina um JWT que contém o ID do usuário como `sub` e tem validade de 8 horas.
6. O front-end guarda o token no `localStorage` e o envia nas próximas requisições. Ao sair, remove essa cópia do navegador.

O JWT é **assinado**, não criptografado; seu conteúdo pode ser lido. Por isso, não colocamos senha ou hash no token. Também não devolvemos o hash em `Usuario.toDict()`.

O `.env` que acompanha o ZIP já contém uma chave gerada para facilitar a aula. Guarde esse arquivo em local privado e troque a chave antes de qualquer implantação. O projeto é uma demonstração local: `localStorage` deixa o token acessível ao JavaScript da página, o logout não revoga um token já copiado e a troca de senha não invalida os tokens já emitidos. Para uma aplicação pública, é necessário avaliar proteção contra XSS, armazenamento e revogação de sessão, HTTPS e permissões. As operações síncronas de SQLite e bcrypt também foram escolhidas pela simplicidade, não para cargas elevadas.

## 6. Relacionamentos no SQLite

| Tabela | Papel |
| --- | --- |
| `autores` | Nome e e-mail dos autores. |
| `livros` | Título, ano e ISBN de cada exemplar. |
| `livros_autores` | Liga um livro a um ou mais autores, sem duplicar a mesma associação. |
| `usuarios` | Nome, e-mail e hash da senha. |
| `emprestimos` | Liga um usuário a um livro e guarda datas de empréstimo e devolução. |

`data_devolucao` igual a `NULL` indica que o empréstimo está ativo. Um índice único parcial no banco impede dois empréstimos ativos para o mesmo livro, mesmo se houver tentativas simultâneas. Ao cadastrar ou editar um livro, uma transação grava o livro e suas associações em conjunto.

## 7. Endpoints principais

`Pública` significa que a rota dispensa token. `Protegida` exige o cabeçalho `Authorization: Bearer SEU_TOKEN`.

| Método | Rota | Acesso | Ação |
| --- | --- | --- | --- |
| `POST` | `/api/usuarios` | Pública | Cadastrar conta com nome, e-mail e senha. |
| `POST` | `/api/auth/login` | Pública | Validar credenciais e obter token. |
| `GET`, `PUT`, `DELETE` | `/api/usuarios/eu` | Protegida | Consultar, editar ou excluir a própria conta. |
| `GET` | `/api/autores`, `/api/autores/:id` | Pública | Listar ou consultar autores. |
| `POST`, `PUT`, `DELETE` | `/api/autores`, `/api/autores/:id` | Protegida | Cadastrar, editar ou excluir autor. |
| `GET` | `/api/livros`, `/api/livros/:id` | Pública | Listar ou consultar livros. |
| `POST`, `PUT`, `DELETE` | `/api/livros`, `/api/livros/:id` | Protegida | Cadastrar, editar ou excluir livro. |
| `GET`, `POST` | `/api/emprestimos` | Protegida | Listar os próprios empréstimos ou emprestar livro. |
| `PATCH` | `/api/emprestimos/:id/devolucao` | Protegida | Devolver o próprio empréstimo. |

Para cadastrar ou atualizar um livro, o corpo usa IDs de autores já cadastrados:

```json
{
  "titulo": "Meu livro",
  "ano": 2026,
  "isbn": "0123456789",
  "autores_ids": [1, 2]
}
```

As rotas agora usam o prefixo `/api` e o relacionamento `autores_ids`; chamadas do projeto anterior precisam ser adaptadas. Consulte `requisicoes.http` para exemplos.
