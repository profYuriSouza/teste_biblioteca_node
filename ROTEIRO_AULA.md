# Roteiro de aula — da tela ao banco

Este roteiro é uma sugestão. O projeto continua funcionando se você apresentar apenas parte dos arquivos.

## 1. Mostrar primeiro o sistema funcionando

1. No terminal, execute `npm install`, `npm run seed` e `npm start`, uma vez cada. Acesse `http://localhost:5000`.
2. Sem login, mostre que é possível consultar livros e autores. O catálogo já inclui um livro com dois autores.
3. Clique em **Entrar** e use `leitor@biblioteca.com` / `12345678`.
4. Na aba **Autores**, cadastre um autor. No **Catálogo**, cadastre um livro e selecione um ou mais autores.
5. Empreste o livro e abra **Meus empréstimos**. Registre a devolução e volte ao catálogo: o exemplar fica disponível novamente.
6. Mostre **Minha conta** e a opção **Sair**. Se houver tempo, cadastre outra conta e mostre que o histórico pertence a cada usuário.

Pergunta para a turma: *onde ficam os dados depois que fechamos o navegador ou reiniciamos o servidor?* Eles continuam no arquivo `dados/biblioteca.sqlite`.

## 2. Identificar front-end e back-end

Abra `server.js` e localize `express.static(...)`. O Express envia o HTML, o CSS e o JavaScript que estão em `public/`.

- `public/index.html`: descreve o que existe na página: formulários, botões e espaços para listas.
- `public/css/estilo.css`: define a apresentação. Pode ser mostrado rapidamente, pois o foco é o back-end.
- `public/js/app.js`: escuta ações do usuário e cria os elementos das listas.
- `public/js/api.js`: concentra `fetch`, envio de JSON, tratamento de resposta e cabeçalho de autorização.

Não há Jinja neste projeto; o navegador recebe um HTML estático e o JavaScript preenche as partes dinâmicas depois de consultar a API. O navegador não acessa o arquivo SQLite diretamente.

## 3. Seguir uma requisição real

Sugestão: use o cadastro de um autor, que é mais curto que o de um livro.

1. Em `public/index.html`, encontre o formulário `form-autor` e seus campos.
2. Em `public/js/app.js`, encontre o evento `submit` desse formulário. `preventDefault()` evita o recarregamento; o código monta o objeto e chama a API.
3. Em `public/js/api.js`, mostre `JSON.stringify`, `fetch`, o método HTTP e o cabeçalho `Authorization`.
4. Em `server.js`, mostre `express.json()` e o registro de `/api/autores`.
5. Em `routes/autor_routes.js`, mostre `router.post` e o middleware de autenticação.
6. Em `services/autor_services.js`, mostre a validação e a chamada ao repository.
7. Em `repositories/autor_repository_sqlite.js`, mostre o `INSERT` e os parâmetros `?`.
8. A rota transforma o objeto em dados de resposta com `toDict()`; o navegador usa o JSON para redesenhar a lista.

Você pode abrir as ferramentas do navegador em **Rede / Network** para observar o método, o corpo e a resposta. Evite compartilhar o token exibido no cabeçalho.

## 4. Explicar o relacionamento livro–autor

Abra `database/schema.sql`. As tabelas são `livros`, `autores` e `livros_autores`. Explique que um livro pode ter vários autores e um autor pode participar de vários livros: por isso existe uma tabela intermediária.

Mostre no formulário de livro os autores selecionados e, em `public/js/app.js`, o array `autores_ids`. No servidor, `LivroService` exige ao menos um autor e confere se cada ID existe. Em `livro_repository_sqlite.js`, `adicionar()` grava livro e associações dentro de uma transação; `paraModelo()` usa `JOIN` para consultar os autores.

## 5. Explicar cadastro e login

- `services/usuario_services.js`: valida a senha e chama `gerarHash()` antes de salvar.
- `security/senhas.js`: usa bcrypt para gerar e comparar hashes. O salt já faz parte do hash retornado.
- `models/usuario.js`: `toDict()` não inclui a senha nem o hash.
- `services/auth_services.js`: consulta pelo e-mail, verifica o hash e solicita um token.
- `security/config_jwt.js`: assina o token com a chave lida do `.env` e define a validade.
- `public/js/api.js`: guarda o token e envia `Authorization: Bearer <token>`.
- `security/middleware_auth.js`: usa `verify`, obtém o ID autenticado e chama `next()` para liberar a rota.

Um hash é usado para **verificar** senhas. O JWT é um token assinado que leva uma identificação e uma validade; ele não deve carregar dados secretos. Esconder um botão na interface não protege a operação: a checagem efetiva acontece no servidor.

## 6. Explicar empréstimo e devolução

Em `routes/emprestimo_routes.js`, todas as rotas usam o middleware. O corpo de criação informa o livro, e o usuário vem de `req.usuarioId`. O Service impede empréstimo de livro inexistente ou indisponível.

Em `schema.sql`, procure o índice `um_emprestimo_ativo_por_livro`. O banco também impede que um livro tenha dois empréstimos ativos. Na devolução, `data_devolucao` passa a ter uma data; assim, o histórico continua disponível e o livro volta a ficar disponível.

## 7. Se quiser demonstrar os dados por SQL

Em uma extensão de SQLite do VS Code, abra `dados/biblioteca.sqlite` e execute:

```sql
SELECT id, nome, email, senha_hash FROM usuarios;
```

Observe que existe um hash, não a senha em texto puro. Não use hashes reais de usuários em apresentações públicas.

```sql
SELECT l.titulo, a.nome AS autor
FROM livros l
JOIN livros_autores la ON la.livro_id = l.id
JOIN autores a ON a.id = la.autor_id
ORDER BY l.titulo;
```

```sql
SELECT e.id, u.nome AS usuario, l.titulo,
       e.data_emprestimo, e.data_devolucao
FROM emprestimos e
JOIN usuarios u ON u.id = e.usuario_id
JOIN livros l ON l.id = e.livro_id;
```

O arquivo `requisicoes.http` oferece chamadas opcionais para mostrar a API sem usar a interface. Não é preciso usar extensão alguma para rodar o sistema.
