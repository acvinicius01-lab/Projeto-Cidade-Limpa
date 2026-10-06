const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
test('registrar, buscar, filtrar, concluir e remover um problema', () => {
  const elements = new Map();
  const storage = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      value: id === 'filter-status' ? 'todos' : '', textContent: '', innerHTML: '', dataset: {},
      classList: { add() {}, remove() {} }, listeners: {},
      addEventListener(name, callback) { this.listeners[name] = callback; },
      reset() {}, scrollIntoView() {}, removeAttribute() {},
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    document: { getElementById: element, querySelectorAll: () => [], querySelector: () => element('brand'), addEventListener() {} },
    localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) },
    crypto: { randomUUID: () => 'test-id' }, setTimeout() {}, confirm: () => true,
  });
  vm.runInContext(fs.readFileSync('script.js', 'utf8'), context);
  element('den-local').value = ' Praça central ';
  element('den-descricao').value = '<script>teste</script>';
  element('form-denuncia').listeners.submit({ preventDefault() {} });
  assert.equal(JSON.parse(storage.get('denuncias'))[0].local, 'Praça central');
  assert.equal(element('stat-total').textContent, 1);
  assert.ok(element('lista-denuncias').innerHTML.includes('&lt;script&gt;'));
  element('search-records').value = 'inexistente';
  element('search-records').listeners.input();
  assert.match(element('results-count').textContent, /^0 /);
  element('search-records').value = 'praça';
  element('search-records').listeners.input();
  assert.match(element('results-count').textContent, /^1 /);
  element('lista-denuncias').listeners.click({ target: { dataset: { id: 'test-id' }, matches: sel => sel === '.btn-concluir' } });
  assert.equal(element('stat-done').textContent, 1);
  element('filter-status').value = 'pendente';
  element('filter-status').listeners.change();
  assert.match(element('results-count').textContent, /^0 /);
  element('lista-denuncias').listeners.click({ target: { dataset: { id: 'test-id' }, matches: sel => sel === '.btn-remover' } });
  assert.equal(JSON.parse(storage.get('denuncias')).length, 0);
});
