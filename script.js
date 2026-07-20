"use strict";

/* =========================================================
   CONFIGURAÇÃO DOS TRÊS NÍVEIS

   Todos os arquivos devem ficar na mesma pasta do index.html:

   Nível 1: img01.jpg até img20.jpg
   Nível 2: itxt01.jpg até itxt20.jpg
   Nível 3: texto01.jpg até texto20.jpg
   Verso das cartas: capa.jpg
========================================================= */

const EXTENSAO_IMAGENS = "jpg";
const IMAGEM_CAPA = `capa.${EXTENSAO_IMAGENS}`;

const niveis = {
  1: {
    titulo: "NÍVEL 1",
    prefixo: "img"
  },

  2: {
    titulo: "NÍVEL 2",
    prefixo: "itxt"
  },

  3: {
    titulo: "NÍVEL 3",
    prefixo: "texto"
  }
};

/* =========================================================
   PARES DO JOGO

   A ordem dos arquivos segue exatamente a sequência:
   01 animal, 02 coletivo, 03 animal, 04 coletivo...
========================================================= */

const pares = [
  {
    id: 1,
    animal: "Peixe",
    coletivo: "Cardume"
  },
  {
    id: 2,
    animal: "Elefante",
    coletivo: "Manada"
  },
  {
    id: 3,
    animal: "Cão",
    coletivo: "Matilha"
  },
  {
    id: 4,
    animal: "Abelha",
    coletivo: "Enxame"
  },
  {
    id: 5,
    animal: "Ovelha",
    coletivo: "Rebanho"
  },
  {
    id: 6,
    animal: "Lobo",
    coletivo: "Alcateia"
  },
  {
    id: 7,
    animal: "Pássaro",
    coletivo: "Bando"
  },
  {
    id: 8,
    animal: "Camelo",
    coletivo: "Cáfila"
  },
  {
    id: 9,
    animal: "Boi",
    coletivo: "Boiada"
  },
  {
    id: 10,
    animal: "Borboleta",
    coletivo: "Panapaná"
  }
];

/* =========================================================
   REFERÊNCIAS DO HTML
========================================================= */

const telaInicial = document.getElementById("telaInicial");
const telaJogo = document.getElementById("telaJogo");
const botoesNivel = document.querySelectorAll("[data-nivel]");
const botaoVoltar = document.getElementById("voltar");
const botaoReiniciar = document.getElementById("reiniciar");
const tabuleiro = document.getElementById("tabuleiro");
const tentativasTexto = document.getElementById("tentativas");
const paresEncontradosTexto = document.getElementById("paresEncontrados");
const nivelAtualTexto = document.getElementById("nivelAtual");
const mensagem = document.getElementById("mensagem");
const previewNivel1 = document.getElementById("previewNivel1");
const previewNivel2 = document.getElementById("previewNivel2");
const previewNivel3 = document.getElementById("previewNivel3");

/* =========================================================
   ESTADO DO JOGO
========================================================= */

let nivelAtual = 1;
let cartas = [];
let primeiraCarta = null;
let segundaCarta = null;
let bloqueio = false;
let tentativas = 0;
let quantidadeParesEncontrados = 0;

const ultimaMiniaturaPorNivel = {
  1: 0,
  2: 0
};

/* =========================================================
   FUNÇÕES UTILITÁRIAS
========================================================= */

function trocarTela(telaAtual, proximaTela) {
  telaAtual.classList.add("saindo");

  window.setTimeout(() => {
    telaAtual.classList.remove("ativa");
    telaAtual.classList.remove("saindo");
    proximaTela.classList.add("ativa");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, 450);
}

function formatarNumero(numero) {
  return String(numero).padStart(2, "0");
}

function criarNomeArquivo(prefixo, numero) {
  return `${prefixo}${formatarNumero(numero)}.${EXTENSAO_IMAGENS}`;
}

function embaralhar(lista) {
  const copia = [...lista];

  for (let indice = copia.length - 1; indice > 0; indice -= 1) {
    const indiceAleatorio = Math.floor(Math.random() * (indice + 1));

    [copia[indice], copia[indiceAleatorio]] = [
      copia[indiceAleatorio],
      copia[indice]
    ];
  }

  return copia;
}


function sortearNumeroDiferente(anterior) {
  let numeroSorteado = Math.floor(Math.random() * 20) + 1;

  if (numeroSorteado === anterior) {
    numeroSorteado = (numeroSorteado % 20) + 1;
  }

  return numeroSorteado;
}

function atualizarMiniaturaDoNivel(nivel, elementoImagem) {
  const numeroSorteado = sortearNumeroDiferente(
    ultimaMiniaturaPorNivel[nivel]
  );

  ultimaMiniaturaPorNivel[nivel] = numeroSorteado;

  elementoImagem.src = criarNomeArquivo(
    niveis[nivel].prefixo,
    numeroSorteado
  );
}

function atualizarMiniaturasDaTelaInicial() {
  atualizarMiniaturaDoNivel(1, previewNivel1);
  atualizarMiniaturaDoNivel(2, previewNivel2);

  previewNivel3.src = IMAGEM_CAPA;
}

function configurarFalhaDasMiniaturas() {
  [previewNivel1, previewNivel2, previewNivel3].forEach((imagem) => {
    imagem.addEventListener("error", () => {
      imagem.src = IMAGEM_CAPA;
    });
  });
}

function aplicarFalhaDeImagem(imagem) {
  imagem.addEventListener(
    "error",
    () => {
      imagem.classList.add("imagem-indisponivel");
      imagem.alt = "Imagem não encontrada";
    },
    { once: true }
  );
}

/* =========================================================
   CRIAÇÃO DAS CARTAS
========================================================= */

function criarCartas() {
  const configuracaoNivel = niveis[nivelAtual];
  const prefixo = configuracaoNivel.prefixo;
  const novasCartas = [];

  pares.forEach((par, indice) => {
    const numeroAnimal = indice * 2 + 1;
    const numeroColetivo = indice * 2 + 2;

    novasCartas.push({
      id: par.id,
      tipo: "animal",
      nome: par.animal,
      imagem: criarNomeArquivo(prefixo, numeroAnimal)
    });

    novasCartas.push({
      id: par.id,
      tipo: "coletivo",
      nome: par.coletivo,
      imagem: criarNomeArquivo(prefixo, numeroColetivo)
    });
  });

  cartas = embaralhar(novasCartas);
}

function criarElementoCarta(carta, indice) {
  const elementoCarta = document.createElement("button");

  elementoCarta.className = "carta";
  elementoCarta.type = "button";
  elementoCarta.dataset.id = String(carta.id);
  elementoCarta.dataset.tipo = carta.tipo;
  elementoCarta.style.animationDelay = `${indice * 0.04}s`;
  elementoCarta.setAttribute(
    "aria-label",
    "Carta fechada. Toque para revelar."
  );

  elementoCarta.innerHTML = `
    <span class="carta-interna">

      <span class="face verso">
        <img
          src="${IMAGEM_CAPA}"
          alt="Face fechada da carta"
          draggable="false"
        />
      </span>

      <span class="face frente">
        <img
          src="${carta.imagem}"
          alt="${carta.nome}"
          draggable="false"
        />
      </span>

    </span>
  `;

  elementoCarta
    .querySelectorAll("img")
    .forEach(aplicarFalhaDeImagem);

  elementoCarta.addEventListener("click", virarCarta);

  return elementoCarta;
}

function montarTabuleiro() {
  tabuleiro.innerHTML = "";

  cartas.forEach((carta, indice) => {
    tabuleiro.appendChild(
      criarElementoCarta(carta, indice)
    );
  });
}

/* =========================================================
   FUNCIONAMENTO DO JOGO
========================================================= */

function virarCarta(evento) {
  const cartaSelecionada = evento.currentTarget;

  if (bloqueio) return;
  if (cartaSelecionada.classList.contains("virada")) return;
  if (cartaSelecionada.classList.contains("encontrada")) return;

  cartaSelecionada.classList.add("virada");
  cartaSelecionada.setAttribute("aria-label", "Carta revelada");

  if (!primeiraCarta) {
    primeiraCarta = cartaSelecionada;
    return;
  }

  segundaCarta = cartaSelecionada;
  tentativas += 1;
  tentativasTexto.textContent = String(tentativas);

  verificarPar();
}

function verificarPar() {
  const idPrimeiraCarta = primeiraCarta.dataset.id;
  const idSegundaCarta = segundaCarta.dataset.id;
  const tipoPrimeiraCarta = primeiraCarta.dataset.tipo;
  const tipoSegundaCarta = segundaCarta.dataset.tipo;

  const mesmoPar = idPrimeiraCarta === idSegundaCarta;
  const tiposDiferentes = tipoPrimeiraCarta !== tipoSegundaCarta;

  if (mesmoPar && tiposDiferentes) {
    confirmarPar();
  } else {
    fecharCartasIncorretas();
  }
}

function confirmarPar() {
  primeiraCarta.classList.add("encontrada");
  segundaCarta.classList.add("encontrada");

  primeiraCarta.setAttribute("aria-label", "Par encontrado");
  segundaCarta.setAttribute("aria-label", "Par encontrado");

  quantidadeParesEncontrados += 1;
  paresEncontradosTexto.textContent = String(quantidadeParesEncontrados);

  limparSelecao();

  if (quantidadeParesEncontrados === pares.length) {
    mensagem.textContent =
      `Parabéns! Você concluiu o ${niveis[nivelAtual].titulo} ` +
      `em ${tentativas} tentativas.`;

    mensagem.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

function fecharCartasIncorretas() {
  bloqueio = true;

  window.setTimeout(() => {
    primeiraCarta.classList.remove("virada");
    segundaCarta.classList.remove("virada");

    primeiraCarta.setAttribute(
      "aria-label",
      "Carta fechada. Toque para revelar."
    );

    segundaCarta.setAttribute(
      "aria-label",
      "Carta fechada. Toque para revelar."
    );

    limparSelecao();
  }, 1000);
}

function limparSelecao() {
  primeiraCarta = null;
  segundaCarta = null;
  bloqueio = false;
}

function iniciarJogo(nivel = nivelAtual) {
  nivelAtual = Number(nivel);
  tentativas = 0;
  quantidadeParesEncontrados = 0;
  primeiraCarta = null;
  segundaCarta = null;
  bloqueio = false;

  tentativasTexto.textContent = "0";
  paresEncontradosTexto.textContent = "0";
  nivelAtualTexto.textContent = niveis[nivelAtual].titulo;
  mensagem.textContent = "";

  criarCartas();
  montarTabuleiro();
}

/* =========================================================
   EVENTOS
========================================================= */

botoesNivel.forEach((botao) => {
  botao.addEventListener("click", () => {
    const nivelSelecionado = Number(botao.dataset.nivel);

    iniciarJogo(nivelSelecionado);
    trocarTela(telaInicial, telaJogo);
  });
});

botaoReiniciar.addEventListener("click", () => {
  iniciarJogo(nivelAtual);
});

botaoVoltar.addEventListener("click", () => {
  limparSelecao();
  atualizarMiniaturasDaTelaInicial();
  trocarTela(telaJogo, telaInicial);
});

configurarFalhaDasMiniaturas();
atualizarMiniaturasDaTelaInicial();