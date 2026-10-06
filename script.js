function lerDados(chave) {
  try { const dados = JSON.parse(localStorage.getItem(chave) || "[]"); return Array.isArray(dados) ? dados.filter(d => d && typeof d === "object") : []; } catch { return []; }
}
function salvarDados(chave, dados) {
  try { localStorage.setItem(chave, JSON.stringify(dados)); return true; } catch { avisar("Não foi possível salvar. Verifique o espaço disponível e se o navegador permite armazenamento local."); return false; }
}
function escapar(valor) { return String(valor ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function avisar(texto) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = texto; feedback.classList.remove("oculta"); feedback.scrollIntoView({block:"nearest", behavior:"smooth"});
}
// Remove senhas legadas do protótipo anterior.
const perfisAntigos = lerDados("usuarios");
if (perfisAntigos.some(u => "senha" in u)) salvarDados("usuarios", perfisAntigos.map(({nome, email}) => ({nome, email})));
// ===== Controle do menu dropdown =====
const menus = document.querySelectorAll(".menu");

menus.forEach((menu) => {
  const botao = menu.querySelector(".menu-btn");
  botao.setAttribute("aria-expanded", "false");
  botao.setAttribute("aria-controls", menu.querySelector(".dropdown").id);
  botao.addEventListener("click", (e) => {
    e.stopPropagation();
    const jaAberto = menu.classList.contains("aberto");
    fecharTodosMenus();
    if (!jaAberto) { menu.classList.add("aberto"); botao.setAttribute("aria-expanded", "true"); }
  });
});

document.addEventListener("click", fecharTodosMenus);

function fecharTodosMenus() {
  menus.forEach((menu) => { menu.classList.remove("aberto"); menu.querySelector(".menu-btn").setAttribute("aria-expanded", "false"); });
}

// ===== Navegação entre telas =====
const telas = document.querySelectorAll(".tela");
const itensMenu = document.querySelectorAll("[data-tela]");
document.querySelector("[data-inicio]").addEventListener("click", e => { e.preventDefault(); mostrarTela("inicial"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharTodosMenus(); });

itensMenu.forEach((item) => {
  item.addEventListener("click", () => {
    mostrarTela(item.dataset.tela);
    fecharTodosMenus();
  });
});

function mostrarTela(id) {
  const alvo = document.getElementById(`tela-${id}`);
  if (!alvo) return;
  document.getElementById("feedback").classList.add("oculta");
  document.querySelectorAll(".menu-bar [data-tela]").forEach(b => { if (b.dataset.tela === id) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  telas.forEach((tela) => tela.classList.add("oculta"));
  const tela = document.getElementById(`tela-${id}`);
  tela.classList.remove("oculta");
  const titulo = tela.querySelector("h1, h2"); titulo.tabIndex = -1; titulo.focus();
}

// ===== Botões "Voltar" (retornam para a tela inicial) =====
document.querySelectorAll("[data-voltar]").forEach((botao) => {
  botao.addEventListener("click", () => mostrarTela("inicial"));
});

// ===== Cadastro (salvo no localStorage do navegador) =====
const formCadastro = document.getElementById("form-cadastro");
const listaUsuarios = document.getElementById("lista-usuarios");

formCadastro.addEventListener("submit", (e) => {
  e.preventDefault();

  const usuario = {
    nome: document.getElementById("cad-nome").value.trim(),
    email: document.getElementById("cad-email").value.trim().toLowerCase(),
  };

  const usuarios = lerDados("usuarios");
  if (!usuario.nome) return;
  if (usuarios.some(u => u.email === usuario.email)) { avisar("Este e-mail já está cadastrado neste navegador."); return; }
  usuarios.push(usuario);
  if (!salvarDados("usuarios", usuarios)) return;

  formCadastro.reset();
  mostrarMensagem("msg-cadastro");
  renderizarUsuarios();
});

function renderizarUsuarios() {
  const usuarios = lerDados("usuarios");
  if (!usuarios.length) { listaUsuarios.textContent = "Você pode registrar problemas sem preencher um perfil."; return; }
  listaUsuarios.innerHTML = usuarios
    .map((u) => `<div class="item-lista"><strong>${escapar(u.nome)}</strong> — ${escapar(u.email)}</div>`)
    .join("");
}

// ===== Denúncia (com foto opcional, salva no localStorage) =====
const formDenuncia = document.getElementById("form-denuncia");
const inputFoto = document.getElementById("den-foto");
const previewFoto = document.getElementById("preview-foto");
const listaDenuncias = document.getElementById("lista-denuncias");
let fotoBase64 = null;
let leituraFoto = 0;
let carregandoFoto = false;

inputFoto.addEventListener("change", () => {
  const versao = ++leituraFoto;
  fotoBase64 = null; carregandoFoto = false; previewFoto.classList.add("oculta");
  document.getElementById("remove-photo").classList.add("oculta");
  const arquivo = inputFoto.files[0];
  if (!arquivo) {
    fotoBase64 = null;
    previewFoto.classList.add("oculta");
    return;
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024) { avisar("Selecione JPG, PNG ou WebP de até 2 MB."); inputFoto.value = ""; return; }
  carregandoFoto = true;
  const leitor = new FileReader();
  leitor.onerror = () => { if (versao !== leituraFoto) return; carregandoFoto = false; inputFoto.value = ""; avisar("Não foi possível ler a foto."); };
  leitor.onload = () => {
    if (versao !== leituraFoto) return;
    carregandoFoto = false;
    document.getElementById("remove-photo").classList.remove("oculta");
    fotoBase64 = leitor.result;
    previewFoto.src = fotoBase64;
    previewFoto.classList.remove("oculta");
  };
  leitor.readAsDataURL(arquivo);
});

formDenuncia.addEventListener("submit", (e) => {
  e.preventDefault();

  if (carregandoFoto) { avisar("Aguarde o carregamento da foto."); return; }
  const local = document.getElementById("den-local").value.trim();
  const descricao = document.getElementById("den-descricao").value.trim();
  if (!local || !descricao) { avisar("Preencha o local e a descrição."); return; }
  const denuncia = {
    id: crypto.randomUUID(),
    local,
    descricao,
    foto: fotoBase64,
    data: new Date().toLocaleString("pt-BR"),
    status: "pendente",
  };

  const denuncias = lerDados("denuncias");
  denuncias.push(denuncia);
  if (!salvarDados("denuncias", denuncias)) return;

  formDenuncia.reset();
  fotoBase64 = null;
  previewFoto.classList.add("oculta");
  document.getElementById("description-count").textContent = "0 / 2000 caracteres";
  document.getElementById("remove-photo").classList.add("oculta");
  mostrarMensagem("msg-denuncia");
  renderizarDenuncias();
});

function renderizarDenuncias() {
  const todos = lerDados("denuncias");
  const pendentes = todos.filter(d => d.status !== "concluida").length;
  document.getElementById("stat-total").textContent = todos.length;
  document.getElementById("stat-pending").textContent = pendentes;
  document.getElementById("stat-done").textContent = todos.length - pendentes;
  document.getElementById("nav-count").textContent = todos.length;
  const busca = document.getElementById("search-records").value.trim().toLocaleLowerCase("pt-BR");
  const status = document.getElementById("filter-status").value;
  const denuncias = todos.filter(d => (status === "todos" || (d.status === "concluida" ? "concluida" : "pendente") === status) && (String(d.local) + " " + String(d.descricao)).toLocaleLowerCase("pt-BR").includes(busca)).reverse();
  document.getElementById("results-count").textContent = denuncias.length + " registro(s) encontrado(s)";
  if (!denuncias.length) { listaDenuncias.textContent = todos.length ? "Nenhum registro corresponde à busca. Tente outro termo ou status." : "Seus registros aparecerão aqui. Use Novo registro para começar."; return; }
  listaDenuncias.innerHTML = denuncias
    .map(
      (d) => `
      <div class="item-lista ${d.status === "concluida" ? "concluida" : ""}">
        <div class="item-topo">
          <strong>${escapar(d.local)}</strong>
          <span class="badge ${d.status === "concluida" ? "badge-concluida" : "badge-pendente"}">
            ${d.status === "concluida" ? "Concluído por mim" : "Em acompanhamento"}
          </span>
        </div>
        <span class="item-data">${escapar(d.data)}</span>
        <p>${escapar(d.descricao)}</p>
        ${typeof d.foto === "string" && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d.foto) ? `<img src="${d.foto}" alt="Foto da denúncia">` : ""}
        <div class="item-acoes">
          <button class="btn-concluir" data-id="${escapar(d.id)}">
            ${d.status === "concluida" ? "↺ Reabrir" : "✔ Concluir"}
          </button>
          <button class="btn-remover" data-id="${escapar(d.id)}">🗑 Remover</button>
        </div>
      </div>`
    )
    .join("");
}

listaDenuncias.addEventListener("click", (e) => {
  const denuncias = lerDados("denuncias");

  if (e.target.matches(".btn-concluir")) {
    const id = e.target.dataset.id;
    const denuncia = denuncias.find((d) => String(d.id) === id);
    if (!denuncia) return;
    denuncia.status = denuncia.status === "concluida" ? "pendente" : "concluida";
    if (!salvarDados("denuncias", denuncias)) return;
    renderizarDenuncias();
  }

  if (e.target.matches(".btn-remover")) {
    const id = e.target.dataset.id;
    const confirmar = confirm("Tem certeza que deseja remover esta denúncia?");
    if (!confirmar) return;
    const restantes = denuncias.filter((d) => String(d.id) !== id);
    if (!salvarDados("denuncias", restantes)) return;
    renderizarDenuncias();
  }
});

// ===== Utilitário: mostra mensagem de sucesso por 3 segundos =====
function mostrarMensagem(id) {
  const msg = document.getElementById(id);
  msg.classList.remove("oculta");
  setTimeout(() => msg.classList.add("oculta"), 3000);
}

document.getElementById("search-records").addEventListener("input", renderizarDenuncias);
document.getElementById("filter-status").addEventListener("change", renderizarDenuncias);
document.getElementById("den-descricao").addEventListener("input", e => { document.getElementById("description-count").textContent = e.target.value.length + " / 2000 caracteres"; });
document.getElementById("remove-photo").addEventListener("click", () => {
  ++leituraFoto; carregandoFoto = false; fotoBase64 = null; inputFoto.value = ""; previewFoto.removeAttribute("src"); previewFoto.classList.add("oculta"); document.getElementById("remove-photo").classList.add("oculta");
});

// Carrega dados salvos ao abrir a página
renderizarUsuarios();
renderizarDenuncias();
