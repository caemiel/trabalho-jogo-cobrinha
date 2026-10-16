const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btnIniciar = document.getElementById("btn-iniciar");
const btnLimpar = document.getElementById("btn-limpar");
const campoNome = document.getElementById("nome");
const textoPontos = document.getElementById("pontos");
const textoRecorde = document.getElementById("recorde");
const mensagem = document.getElementById("mensagem");
const listaRanking = document.getElementById("lista-ranking");

const TAMANHO = 20;
const COLUNAS = canvas.width / TAMANHO;
const VELOCIDADE_INICIAL = 150;
const VELOCIDADE_MINIMA = 70;
const CHAVE_RANKING = "ranking-cobrinha";

let cobra = [];
let direcao = "direita";
let proximaDirecao = "direita";
let comida = { x: 0, y: 0 };
let pontos = 0;
let velocidade = VELOCIDADE_INICIAL;
let temporizador = null;
let jogando = false;

const ARQUIVO_IMAGEM_COMIDA = "comida.png";
const imagemComida = new Image();
imagemComida.src = ARQUIVO_IMAGEM_COMIDA;
imagemComida.onload = desenhar;

function iniciarJogo() {
  cobra = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];

  direcao = "direita";
  proximaDirecao = "direita";
  pontos = 0;
  velocidade = VELOCIDADE_INICIAL;
  jogando = true;

  textoPontos.textContent = pontos;
  mensagem.classList.add("escondida");
  btnIniciar.textContent = "Reiniciar";

  sortearComida();
  desenhar();

  clearInterval(temporizador);
  temporizador = setInterval(atualizar, velocidade);
}

function atualizar() {
  direcao = proximaDirecao;

  const cabeca = { x: cobra[0].x, y: cobra[0].y };

  if (direcao === "cima") cabeca.y--;
  if (direcao === "baixo") cabeca.y++;
  if (direcao === "esquerda") cabeca.x--;
  if (direcao === "direita") cabeca.x++;

  if (cabeca.x < 0) cabeca.x = COLUNAS - 1;
  if (cabeca.x >= COLUNAS) cabeca.x = 0;
  if (cabeca.y < 0) cabeca.y = COLUNAS - 1;
  if (cabeca.y >= COLUNAS) cabeca.y = 0;

  if (bateuNoCorpo(cabeca)) {
    fimDeJogo();
    return;
  }

  cobra.unshift(cabeca);

  if (cabeca.x === comida.x && cabeca.y === comida.y) {
    pontos += 10;
    textoPontos.textContent = pontos;
    sortearComida();
    aumentarVelocidade();
  } else {
    cobra.pop();
  }

  desenhar();
}

function bateuNoCorpo(cabeca) {
  return cobra.some(parte => parte.x === cabeca.x && parte.y === cabeca.y);
}

function sortearComida() {
  do {
    comida.x = Math.floor(Math.random() * COLUNAS);
    comida.y = Math.floor(Math.random() * COLUNAS);
  } while (cobra.some(parte => parte.x === comida.x && parte.y === comida.y));
}

function aumentarVelocidade() {
  if (velocidade > VELOCIDADE_MINIMA) {
    velocidade -= 5;
    clearInterval(temporizador);
    temporizador = setInterval(atualizar, velocidade);
  }
}

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (imagemComida.complete && imagemComida.naturalWidth > 0) {
    ctx.drawImage(
      imagemComida,
      comida.x * TAMANHO,
      comida.y * TAMANHO,
      TAMANHO,
      TAMANHO
    );
  } else {
    ctx.fillStyle = "#E0AAFF";
    ctx.beginPath();
    ctx.arc(
      comida.x * TAMANHO + TAMANHO / 2,
      comida.y * TAMANHO + TAMANHO / 2,
      TAMANHO / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  cobra.forEach((parte, indice) => {
    ctx.fillStyle = indice === 0 ? "#C77DFF" : "#5A189A";
    ctx.fillRect(
      parte.x * TAMANHO + 1,
      parte.y * TAMANHO + 1,
      TAMANHO - 2,
      TAMANHO - 2
    );
  });
}

function fimDeJogo() {
  clearInterval(temporizador);
  jogando = false;

  const nome = campoNome.value.trim() || "Anônimo";

  salvarNoRanking(nome, pontos);
  mostrarRanking();

  mensagem.textContent =
    "Fim de jogo!\n" +
    nome +
    ", você fez " +
    pontos +
    " pontos.\nClique em Reiniciar.";

  mensagem.classList.remove("escondida");
}

function lerRanking() {
  const texto = localStorage.getItem(CHAVE_RANKING);
  return texto ? JSON.parse(texto) : [];
}

function salvarNoRanking(nome, pontuacao) {
  if (pontuacao === 0) return;

  const ranking = lerRanking();
  ranking.push({ nome: nome, pontos: pontuacao });
  ranking.sort((a, b) => b.pontos - a.pontos);

  const top5 = ranking.slice(0, 5);
  localStorage.setItem(CHAVE_RANKING, JSON.stringify(top5));
}

function mostrarRanking() {
  const ranking = lerRanking();
  listaRanking.innerHTML = "";

  if (ranking.length === 0) {
    listaRanking.innerHTML = '<li class="vazio">Ninguém pontuou ainda.</li>';
    textoRecorde.textContent = 0;
    return;
  }

  ranking.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.nome;

    const span = document.createElement("span");
    span.textContent = item.pontos;

    li.appendChild(span);
    listaRanking.appendChild(li);
  });

  textoRecorde.textContent = ranking[0].pontos;
}

function mudarDirecao(nova) {
  if (nova === "cima" && direcao !== "baixo") proximaDirecao = "cima";
  if (nova === "baixo" && direcao !== "cima") proximaDirecao = "baixo";
  if (nova === "esquerda" && direcao !== "direita") proximaDirecao = "esquerda";
  if (nova === "direita" && direcao !== "esquerda") proximaDirecao = "direita";
}

document.addEventListener("keydown", evento => {
  const teclas = {
    ArrowUp: "cima",
    w: "cima",
    W: "cima",
    ArrowDown: "baixo",
    s: "baixo",
    S: "baixo",
    ArrowLeft: "esquerda",
    a: "esquerda",
    A: "esquerda",
    ArrowRight: "direita",
    d: "direita",
    D: "direita"
  };

  const nova = teclas[evento.key];

  if (nova && jogando) {
    evento.preventDefault();
    mudarDirecao(nova);
  }
});

document.querySelectorAll(".direcionais button").forEach(botao => {
  botao.addEventListener("click", () => {
    if (jogando) mudarDirecao(botao.dataset.dir);
  });
});

btnIniciar.addEventListener("click", iniciarJogo);

btnLimpar.addEventListener("click", () => {
  localStorage.removeItem(CHAVE_RANKING);
  mostrarRanking();
});

mostrarRanking();
desenhar();