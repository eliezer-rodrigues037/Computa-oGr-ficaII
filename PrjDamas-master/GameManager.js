class GameManager {

    constructor(scene) {
        this.scene = scene;
        this.tabuleiro = undefined;
        this.matrizTabuleiro = null;
        this.matrizPecas = [];
        this.proximasJogadas = [];
        this.jogadorAtual = jogadores.Jogador1;
        this.pecaSelecionada = undefined;
        this.txtJogadorAtual = undefined;
        this.txtVencedor = undefined;
        this.btnReset = undefined;
        this.highlightPeca = new BABYLON.HighlightLayer("highlightPeça", scene);
        this.highlightPecaSel = new BABYLON.HighlightLayer("highlightPeçaSelecionada", scene);
        this.highlightPecaRem = new BABYLON.HighlightLayer("highlightPeçaRemovida", scene);
        this.highlightCasas = new BABYLON.HighlightLayer("highlightCasas", scene);
    }

    // Criação do ambiente inicial
    CriarAmbienteInicial() {
        this.tabuleiro = new Tabuleiro();
        this.matrizTabuleiro = this.tabuleiro.CriarTabuleiro();
        this.jogadorAtual = jogadores.Jogador1;

        for (var i = 0; i < TamTabuleiro; i++) {
            this.matrizPecas[i] = new Array(8);
        }

        // Criação das peças do jogador 1
        let jogador = jogadores.Jogador1;
        for (var i = 0; i < 3; i++) {
            for (var j = i % 2; j < TamTabuleiro; j += 2) {
                let peca = new Peca(i, j, jogador, this.scene);
                this.matrizPecas[i][j] = peca;
                this.VincularEventosPeca(peca);
            }
        }

        // Criação das peças do jogador 2
        jogador = jogadores.Jogador2;
        for (var i = 7; i > 4; i--) {
            for (var j = i % 2; j < TamTabuleiro; j += 2) {
                let peca = new Peca(i, j, jogador, this.scene);
                this.matrizPecas[i][j] = peca;
                this.VincularEventosPeca(peca);
            }
        }

        this.CriarGUI();
        this.GerarJogadasPossiveis(this.jogadorAtual);
    }

    CriarGUI() {
        
        var gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");

        this.txtJogadorAtual = new BABYLON.GUI.TextBlock();
        this.txtJogadorAtual.text = "Turno do jogador 1";
        this.txtJogadorAtual.color = "red";
        this.txtJogadorAtual.fontSize = 70;
        this.txtJogadorAtual.top = "-40%";

        this.txtVencedor = new BABYLON.GUI.TextBlock();
        this.txtVencedor.text = "Jogador x Venceu!";
        this.txtVencedor.color = "yellow";
        this.txtVencedor.fontSize = 120;
        this.txtVencedor.isVisible = false;

        //Reset Button
        this.btnReset = BABYLON.GUI.Button.CreateSimpleButton("btnReset", "Reiniciar");
        this.btnReset.top = "40%";
        this.btnReset.left = "0px";
        this.btnReset.width = "200px";
        this.btnReset.height = "50px";
        this.btnReset.thickness = 4;
        this.btnReset.children[0].color = "#DFF9FB";
        this.btnReset.children[0].fontSize = 24;
        this.btnReset.color = "#FF7979";
        this.btnReset.background = "#EB4D4B"

        var onBtnResetClick = () => {
            this.tabuleiro.DestruirTabuleiro();
            this.matrizPecas.forEach((linha) => {
                linha.forEach((col) => {
                    if (col) {
                        col.mesh.dispose();
                    }
                })
            });
            this.btnReset.dispose();
            this.txtJogadorAtual.dispose();
            this.txtVencedor.dispose();
            this.CriarAmbienteInicial();
        }

        this.btnReset.onPointerClickObservable.add(onBtnResetClick);

        gui.addControl(this.txtJogadorAtual);
        gui.addControl(this.txtVencedor);
        gui.addControl(this.btnReset);
    }

    // Método para trocar de turno
    TrocarTurno() {
        if (this.jogadorAtual == jogadores.Jogador1) {
            this.jogadorAtual = jogadores.Jogador2;
            this.txtJogadorAtual.text = "Turno do jogador 2";
            this.txtJogadorAtual.color = "blue";
        }
        else {
            this.jogadorAtual = jogadores.Jogador1;
            this.txtJogadorAtual.text = "Turno do jogador 1";
            this.txtJogadorAtual.color = "red";
        }

        //Removendo todos os highlights e peça selecionada
        this.highlightPeca.removeAllMeshes();
        this.highlightPecaSel.removeAllMeshes();
        this.highlightCasas.removeAllMeshes();
        this.highlightPecaRem.removeAllMeshes();
        this.pecaSelecionada = undefined;

        if (!this.VerificarVitoria()) {
            // Ao finalizar um turno, é gerado todas as jogadas possíveis para o jogador
            this.GerarJogadasPossiveis(this.jogadorAtual)
        }
    }

    VerificarVitoria() {
        let qtdJ1 = 0;
        let qtdJ2 = 0;
        this.matrizPecas.forEach((linha) => {
            linha.forEach((col) => {
                if (col) {
                    if (col.jogador == jogadores.Jogador1)
                        qtdJ1++;
                    else
                        qtdJ2++;
                }
            });
        });

        if (qtdJ1 == 0) {
            this.txtVencedor.text = "Jogador 2 Venceu!";
            this.txtVencedor.isVisible = true;
            return true;
        }
        else if (qtdJ2 == 0) {
            this.txtVencedor.text = "Jogador 1 Venceu!";
            this.txtVencedor.isVisible = true;
            return true;
        }

        return false;
    }

    // Método para vincular os eventos de hover e click na peça
    VincularEventosPeca(pecaObj) {
        let mesh = pecaObj.mesh;

        mesh.actionManager = new BABYLON.ActionManager(this.scene);
        // registrar Evento de hover na peça para dar um highlight ao passar pela peça, branco caso possua movimento válido, vermleho caso não tenha
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
            if (pecaObj.jogador == this.jogadorAtual && !this.highlightPeca.hasMesh(mesh) && !this.highlightPecaSel.hasMesh(mesh)) {
                if (pecaObj.proximaJogadas && pecaObj.proximaJogadas.length > 0)
                    this.highlightPeca.addMesh(mesh, BABYLON.Color3.White());
                else
                    this.highlightPeca.addMesh(mesh, BABYLON.Color3.Red());
            }
        }));

        // registrar evento de sair do hover da peça, removendo o highlight
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
            if (this.highlightPeca.hasMesh(mesh))
                this.highlightPeca.removeMesh(mesh);
        }));

        // registrar evento de click na peça, dando um highlight verde para peça selecionada e vinculando os eventos da jogada nas peças em que é possível se movimentar
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
            if (pecaObj.jogador == this.jogadorAtual && pecaObj.proximaJogadas && pecaObj.proximaJogadas.length > 0) {
                if (!this.pecaSelecionada || this.pecaSelecionada != pecaObj) {
                    this.highlightPeca.removeAllMeshes();
                    this.highlightPecaSel.removeAllMeshes();

                    this.highlightPecaSel.addMesh(mesh, BABYLON.Color3.Green());

                    if (this.pecaSelecionada)
                        this.DesvincularEventosCasa(this.pecaSelecionada);

                    this.pecaSelecionada = pecaObj;

                    this.VincularEventosCasa(pecaObj);
                }
                else {
                    this.highlightPeca.removeAllMeshes();
                    this.highlightPecaSel.removeAllMeshes();
                    this.DesvincularEventosCasa(this.pecaSelecionada);
                    this.pecaSelecionada = undefined;
                }
            }
        }))
    }

    // Método para vincular os eventos de hover e click nas casas
    VincularEventosCasa(pecaObj) {
        if (pecaObj.proximaJogadas && pecaObj.proximaJogadas.length > 0) {
            // forEach para cada jogada que a peça pode realizar
            pecaObj.proximaJogadas.forEach((jog) => {
                let casaObj = this.matrizTabuleiro[jog.objetivo.x][jog.objetivo.y];

                casaObj.material.diffuseColor = new BABYLON.Color3(0, 1, 0);

                casaObj.actionManager = new BABYLON.ActionManager(this.scene);
                // registrar evento para colocar um highlight nas casas visitadas e peças removidas na jogada ao colocar o mouse em cima da casa
                casaObj.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                    if (!this.highlightCasas.hasMesh(casaObj))
                        this.highlightCasas.addMesh(casaObj, BABYLON.Color3.Green());

                    jog.listaMovimentos.forEach((mov) => {
                        let casa = this.matrizTabuleiro[mov.x][mov.y];
                        if (!this.highlightCasas.hasMesh(casa))
                            this.highlightCasas.addMesh(casa, BABYLON.Color3.Green());
                    });

                    jog.pecasRemovidas.forEach((peca) => {
                        if (!this.highlightPecaRem.hasMesh(peca.mesh))
                            this.highlightPecaRem.addMesh(peca.mesh, BABYLON.Color3.Red());
                    });
                }));

                // registrar evento de remover os highlights ao tirar o mouse de cima
                casaObj.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                    this.highlightCasas.removeAllMeshes();
                    this.highlightPecaRem.removeAllMeshes();
                }));

                // registrar evento para andar até a casa e remover as peças ao clicar na casa
                casaObj.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                    this.matrizPecas[pecaObj.posicaoTabuleiro.x][pecaObj.posicaoTabuleiro.y] = undefined;
                    this.matrizPecas[jog.objetivo.x][jog.objetivo.y] = pecaObj;

                    pecaObj.posicaoTabuleiro = new BABYLON.Vector2(jog.objetivo.x, jog.objetivo.y);


                    //Position Animation
                    var frameRate = 60;
                    var framePorMovimento = 10;
                    var frameAtual = framePorMovimento;
                    var posicaoAtual = pecaObj.mesh.position;
                    var move = new BABYLON.Animation("move", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                    var keyFramesP = [];

                    keyFramesP.push({
                        frame: 0,
                        value: pecaObj.mesh.position
                    });

                    jog.listaMovimentos.forEach((mov) => {
                        let casa = this.matrizTabuleiro[mov.x][mov.y];
                        let casaMetade = BABYLON.Vector3.Center(posicaoAtual, casa.position);

                        keyFramesP.push({
                            frame: frameAtual,
                            value: new BABYLON.Vector3(casaMetade.x, pecaObj.mesh.position.y + 2, casaMetade.z)
                        });

                        frameAtual += framePorMovimento;

                        keyFramesP.push({
                            frame: frameAtual,
                            value: new BABYLON.Vector3(casa.position.x, pecaObj.mesh.position.y, casa.position.z)
                        });

                        frameAtual += framePorMovimento;
                        posicaoAtual = casa.position;
                    });

                    move.setKeys(keyFramesP);

                    pecaObj.mesh.animations.push(move);

                    setTimeout(async () => {
                        var newAnimation = scene.beginAnimation(pecaObj.mesh, 0, frameAtual, false, 1, () => {
                            this.AposMovimentarPeca(pecaObj, jog.pecasRemovidas);
                        });
                    });

                    this.DesvincularEventosCasa(pecaObj);
                }));
            })
        }
    }

    AposMovimentarPeca(pecaObj, pecasRemovidas) {
        pecasRemovidas.forEach((peca) => {
            this.matrizPecas[peca.posicaoTabuleiro.x][peca.posicaoTabuleiro.y] = undefined;
            peca.mesh.dispose();
        });

        if ((pecaObj.posicaoTabuleiro.x == TamTabuleiro - 1 && pecaObj.jogador == jogadores.Jogador1) || (pecaObj.posicaoTabuleiro.x == 0 && pecaObj.jogador == jogadores.Jogador2)) {
            pecaObj.TransformarEmDama();
            this.VincularEventosPeca(pecaObj);
        }

        this.TrocarTurno();
    }

    // Método para descinvular os eventos de hover e click das caixas
    DesvincularEventosCasa(pecaObj) {
        if (pecaObj.proximaJogadas && pecaObj.proximaJogadas.length > 0) {
            this.highlightCasas.removeAllMeshes();
            this.highlightPecaRem.removeAllMeshes();

            pecaObj.proximaJogadas.forEach((jog) => {
                let casaObj = this.matrizTabuleiro[jog.objetivo.x][jog.objetivo.y];
                casaObj.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
                casaObj.actionManager = new BABYLON.ActionManager(this.scene);
            });
        }
    }

    // Método para gerar todas as jogadas possíveis no turno
    GerarJogadasPossiveis(jogador) {
        let maxPecasRemovidas = 0; // Variável para definir a quantidad maxima de peças que podem ser removidas em uma jogada

        // forEach para gerar a movimentação possível de cada peça
        this.matrizPecas.forEach((linha) => {
            linha.forEach((pecaObj) => {
                if (pecaObj && jogador == pecaObj.jogador) {
                    // Gerar as jogadas possíveis para essa peça
                    let jogadas = this.GerarProximosMovimentos(pecaObj, pecaObj.posicaoTabuleiro, undefined, [], true, pecaObj.dama);

                    pecaObj.proximaJogadas = jogadas;

                    // Caso a quantidade de peças que essa peça pode remover é maior que o valor maximo atual, atualiza o valor maximo para o dessa peça
                    if (jogadas && jogadas.length > 0 && jogadas[0].pecasRemovidas.length > maxPecasRemovidas) {
                        maxPecasRemovidas = jogadas[0].pecasRemovidas.length;
                    }
                }
            });
        });

        // Novo forEach para remover as jogadas que removem uma quantida menor que o maximo
        this.matrizPecas.forEach((linha) => {
            linha.forEach((pecaObj) => {
                if (pecaObj && jogador == pecaObj.jogador) {
                    // Se o número de peças que a peça pode remover é menor que o máximo, remover jogada
                    if (pecaObj.proximaJogadas && pecaObj.proximaJogadas.length > 0 && pecaObj.proximaJogadas[0].pecasRemovidas.length < maxPecasRemovidas)
                        pecaObj.proximaJogadas = [];
                }
            })
        });
    }

    // Método para gerar os movimentos possíveis
    GerarProximosMovimentos(pecaObj, posAtual, direcaoObj, pecasRemovidas, movIni, dama) {
        let listaJogadas = [];
        let maxPecasRemovidas = 0;
        let movValido = movIni;

        for (var i = -1; i <= 1; i += 2) {
            for (var j = -1; j <= 1; j += 2) {
                let direcao = new BABYLON.Vector2(i, j);    //Direção em que a peça vai se movimentar
                let pecasRemovidasDir = [];
                let x = posAtual.x + direcao.x, y = posAtual.y + direcao.y;
                let dirValida = (dama || (direcao.x > 0 && pecaObj.jogador == jogadores.Jogador1) || (direcao.x < 0 && pecaObj.jogador == jogadores.Jogador2)); // Validar se peça pode se movimentar para este lado
                let houvePecaRemovida = false;

                while (x >= 0 && x < TamTabuleiro && y >= 0 && y < TamTabuleiro && (!direcaoObj || (direcaoObj.x == direcao.x && direcaoObj.y == direcao.y))) {
                    if (!this.matrizPecas[x][y] || (this.matrizPecas[x][y] && this.matrizPecas[x][y].jogador != pecaObj.jogador)) {
                        let novaJogada = new Jogadas(new BABYLON.Vector2(x, y));
                        novaJogada.pecasRemovidas = novaJogada.pecasRemovidas.concat(pecasRemovidasDir);

                        if (this.matrizPecas[x][y] && this.matrizPecas[x][y].jogador != pecaObj.jogador) {
                            let pecaRem = this.matrizPecas[x][y];
                            x += direcao.x;
                            y += direcao.y;

                            if (x < 0 || x >= TamTabuleiro || y < 0 || y >= TamTabuleiro || this.matrizPecas[x][y] || pecasRemovidas.includes(pecaRem))
                                break;

                            novaJogada = new Jogadas(new BABYLON.Vector2(x, y));
                            novaJogada.pecasRemovidas.push(pecaRem);
                            novaJogada.pecasRemovidas = novaJogada.pecasRemovidas.concat(pecasRemovidasDir);
                            pecasRemovidasDir.push(pecaRem);
                            pecasRemovidas.push(pecaRem);
                            houvePecaRemovida = true;
                            movValido = true;

                            if (novaJogada.pecasRemovidas.length > maxPecasRemovidas)
                                maxPecasRemovidas = novaJogada.pecasRemovidas.length;
                        }
                        else if (!dirValida)
                            break;

                        if (movValido) {
                            listaJogadas.push(novaJogada);

                            if (houvePecaRemovida) {
                                let jogadasRot1 = this.GerarProximosMovimentos(pecaObj, new BABYLON.Vector2(x, y), new BABYLON.Vector2(direcao.x, -direcao.y), pecasRemovidas.slice(), false, dama);
                                let jogadasRot2 = this.GerarProximosMovimentos(pecaObj, new BABYLON.Vector2(x, y), new BABYLON.Vector2(-direcao.x, direcao.y), pecasRemovidas.slice(), false, dama);

                                jogadasRot1.forEach((jog) => {
                                    if (jog.pecasRemovidas.length > 0) {
                                        let novaJog = novaJogada.clone();
                                        novaJog.objetivo = jog.objetivo;
                                        novaJog.listaMovimentos = novaJog.listaMovimentos.concat(jog.listaMovimentos);
                                        novaJog.pecasRemovidas = novaJog.pecasRemovidas.concat(jog.pecasRemovidas);

                                        if (novaJog.pecasRemovidas.length > maxPecasRemovidas)
                                            maxPecasRemovidas = novaJog.pecasRemovidas.length;

                                        listaJogadas.push(novaJog);
                                    }
                                });

                                jogadasRot2.forEach((jog) => {
                                    if (jog.pecasRemovidas.length > 0) {
                                        let novaJog = novaJogada.clone();
                                        novaJog.objetivo = jog.objetivo;
                                        novaJog.listaMovimentos = novaJog.listaMovimentos.concat(jog.listaMovimentos);
                                        novaJog.pecasRemovidas = novaJog.pecasRemovidas.concat(jog.pecasRemovidas);

                                        if (novaJog.pecasRemovidas.length > maxPecasRemovidas)
                                            maxPecasRemovidas = novaJog.pecasRemovidas.length;

                                        listaJogadas.push(novaJog);
                                    }
                                });

                                if (!dama) {
                                    let jogadasRot3 = this.GerarProximosMovimentos(pecaObj, new BABYLON.Vector2(x, y), new BABYLON.Vector2(direcao.x, direcao.y), pecasRemovidas.slice(), false, dama);

                                    jogadasRot3.forEach((jog) => {
                                        let novaJog = novaJogada.clone();
                                        novaJog.objetivo = jog.objetivo;
                                        novaJog.listaMovimentos = novaJog.listaMovimentos.concat(jog.listaMovimentos);
                                        novaJog.pecasRemovidas = novaJog.pecasRemovidas.concat(jog.pecasRemovidas);

                                        if (novaJog.pecasRemovidas.length > maxPecasRemovidas)
                                            maxPecasRemovidas = novaJog.pecasRemovidas.length;

                                        listaJogadas.push(novaJog);
                                    });
                                }
                            }
                        }

                        x += direcao.x;
                        y += direcao.y;

                        if (!dama)
                            break;
                    }
                    else
                        break;
                }
            }
        }

        let listaFiltrada = [];
        // forEach para filtrar apenas as jogadas que removem o maximo possível
        listaJogadas.forEach((jog) => {
            if (jog.pecasRemovidas.length == maxPecasRemovidas) {
                listaFiltrada.push(jog);
            }
        });

        return listaFiltrada
    }
}