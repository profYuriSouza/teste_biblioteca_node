const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

// node:sqlite já acompanha o Node.js a partir da versão indicada no README.
// O caminho absoluto é montado a partir deste arquivo, não da pasta do terminal.
const pastaDados = path.join(__dirname, "..", "dados");
fs.mkdirSync(pastaDados, { recursive: true });
const banco = new DatabaseSync(path.join(pastaDados, "biblioteca.sqlite"));

// O SQLite precisa verificar as chaves estrangeiras nesta conexão.
banco.exec("PRAGMA foreign_keys = ON;");
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
banco.exec(schema);

module.exports = banco;
