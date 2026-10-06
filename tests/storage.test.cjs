const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('script.js', 'utf8').split('// Remove senhas legadas')[0];
function context(storage) {
  const ctx = vm.createContext({ localStorage: storage, alert: () => {} });
  vm.runInContext(source, ctx);
  return ctx;
}
test('conteúdo informado pelo usuário é escapado antes de virar HTML', () => {
  const ctx = context({});
  assert.equal(ctx.escapar('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('dados corrompidos, indisponíveis ou com formato inválido não interrompem a leitura', () => {
  for (const value of ['{', '{}', 'null', '[null,42,"texto"]']) {
    const ctx = context({ getItem: () => value });
    assert.equal(ctx.lerDados('denuncias').length, 0);
  }
  assert.equal(context({ getItem: () => { throw Error('bloqueado'); } }).lerDados('usuarios').length, 0);
});
test('falha de armazenamento não é tratada como sucesso', () => {
  const ctx = context({ setItem: () => { throw Error('quota'); } });
  assert.equal(ctx.salvarDados('denuncias', []), false);
});
