// ===== Controle do menu dropdown =====
const menus = document.querySelectorAll(".menu");

menus.forEach((menu) => {
  const botao = menu.querySelector(".menu-btn");
  botao.addEventListener("click", (e) => {
    e.stopPropagation();
    const jaAberto = menu.classList.contains("aberto");
    fecharTodosMenus();
    if (!jaAberto) menu.classList.add("aberto");
  });
});

document.addEventListener("click", fecharTodosMenus);

function fecharTodosMenus() {
  menus.forEach((menu) => menu.classList.remove("aberto"));
}

// ===== Navegação entre telas =====
const telas = document.querySelectorAll(".tela");
const itensMenu = document.querySelectorAll(".dropdown-item");

itensMenu.forEach((item) => {
  item.addEventListener("click", () => {
    mostrarTela(item.dataset.tela);
    fecharTodosMenus();
  });
});

function mostrarTela(id) {
  telas.forEach((tela) => tela.classList.add("oculta"));
  document.getElementById(`tela-${id}`).classList.remove("oculta");
}
document.querySelectorAll("[data-voltar]").forEach((botao) => {
  botao.addEventListener("click", () => mostrarTela("inicial"));
});

// ===== Cadastro (salvo no localStorage do navegador) =====
const formCadastro = document.getElementById("form-cadastro");
const listaUsuarios = document.getElementById("lista-usuarios");

formCadastro.addEventListener("submit", (e) => {
  e.preventDefault();

  const usuario = {
    nome: document.getElementById("cad-nome").value,
    email: document.getElementById("cad-email").value,
    senha: document.getElementById("cad-senha").value,
  };

  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  usuarios.push(usuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  formCadastro.reset();
  mostrarMensagem("msg-cadastro");
  renderizarUsuarios();
});

function renderizarUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  listaUsuarios.innerHTML = usuarios
    .map(
      (u) =>
        `<div class="item-lista"><strong>${u.nome}</strong> — ${u.email}</div>`,
    )
    .join("");
}

// ===== Denúncia (com foto opcional, salva no localStorage) =====
const formDenuncia = document.getElementById("form-denuncia");
const inputFoto = document.getElementById("den-foto");
const previewFoto = document.getElementById("preview-foto");
const listaDenuncias = document.getElementById("lista-denuncias");
let fotoBase64 = null;

inputFoto.addEventListener("change", () => {
  const arquivo = inputFoto.files[0];
  if (!arquivo) {
    fotoBase64 = null;
    previewFoto.classList.add("oculta");
    return;
  }
  const leitor = new FileReader();
  leitor.onload = () => {
    fotoBase64 = leitor.result;
    previewFoto.src = fotoBase64;
    previewFoto.classList.remove("oculta");
  };
  leitor.readAsDataURL(arquivo);
});

formDenuncia.addEventListener("submit", (e) => {
  e.preventDefault();

  const denuncia = {
    local: document.getElementById("den-local").value,
    descricao: document.getElementById("den-descricao").value,
    foto: fotoBase64,
    data: new Date().toLocaleString("pt-BR"),
  };

  const denuncias = JSON.parse(localStorage.getItem("denuncias") || "[]");
  denuncias.push(denuncia);
  localStorage.setItem("denuncias", JSON.stringify(denuncias));

  formDenuncia.reset();
  fotoBase64 = null;
  previewFoto.classList.add("oculta");
  mostrarMensagem("msg-denuncia");
  renderizarDenuncias();
});

function renderizarDenuncias() {
  const denuncias = JSON.parse(localStorage.getItem("denuncias") || "[]");
  listaDenuncias.innerHTML = denuncias
    .map(
      (d) => `
      <div class="item-lista">
        <strong>${d.local}</strong> — ${d.data}<br>
        ${d.descricao}
        ${d.foto ? `<img src="${d.foto}" alt="Foto da denúncia">` : ""}
      </div>`,
    )
    .join("");
}

// ===== Utilitário: mostra mensagem de sucesso por 3 segundos =====
function mostrarMensagem(id) {
  const msg = document.getElementById(id);
  msg.classList.remove("oculta");
  setTimeout(() => msg.classList.add("oculta"), 3000);
}

// Carrega dados salvos ao abrir a página
renderizarUsuarios();
renderizarDenuncias();
