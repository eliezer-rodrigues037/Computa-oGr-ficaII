class Tabuleiro {
    constructor(scene) {
        this.tabuleiro = [];
        for (var i = 0; i < 8; i++)
            this.tabuleiro[i] = new Array(8);

        this.materialsTabuleiro = this.CriarMaterials();
        this.scene = scene;

        this.borda1 = undefined;
        this.borda2 = undefined;
        this.borda3 = undefined;
        this.borda4 = undefined;

        if (!Tabuleiro.highlightCasas)
            Tabuleiro.highlightCasas
    }

    CriarTabuleiro() {
        for (var i = 0; i < TamTabuleiro; i++) {
            for (var j = 0; j < TamTabuleiro; j++) {
                this.tabuleiro[i][j] = this.CriarCasa(PosLinInicial + i, 0, PosColInicial + j, this.materialsTabuleiro[(i + j) % 2]);
            }
        }

        this.borda1 = BABYLON.MeshBuilder.CreateBox('borda', { height: 0.7, width: 1, depth: 10 }, this.scene);
        this.borda2 = BABYLON.MeshBuilder.CreateBox('borda', { height: 0.7, width: 1, depth: 10 }, this.scene);
        this.borda3 = BABYLON.MeshBuilder.CreateBox('borda', { height: 0.7, width: 1, depth: 8 }, this.scene);
        this.borda4 = BABYLON.MeshBuilder.CreateBox('borda', { height: 0.7, width: 1, depth: 8 }, this.scene);

        this.borda1.position.y = 0.1;
        this.borda1.position.z = 4.5;
        this.borda1.rotation.y = Math.PI / 2;
        this.borda1.material = this.materialsTabuleiro[2];

        this.borda2.position.y = 0.1;
        this.borda2.position.z = -4.5;
        this.borda2.rotation.y = Math.PI / 2;
        this.borda2.material = this.materialsTabuleiro[2];

        this.borda3.position.y = 0.1;
        this.borda3.position.x = 4.5;
        this.borda3.material = this.materialsTabuleiro[2];

        this.borda4.position.y = 0.1;
        this.borda4.position.x = -4.5;
        this.borda4.material = this.materialsTabuleiro[2];

        return this.tabuleiro;
    }

    CriarMaterials() {
        var madeiraLightMaterial = new BABYLON.StandardMaterial("MadeiraD", scene);
        madeiraLightMaterial.diffuseTexture = new BABYLON.Texture("Texturas/MadeiraD.jpg", scene);
        madeiraLightMaterial.diffuseTexture.uScale = 1;
        madeiraLightMaterial.diffuseTexture.vScale = 1;

        var madeiraDarkMaterial = new BABYLON.StandardMaterial("MadeiraL", scene);
        madeiraDarkMaterial.diffuseTexture = new BABYLON.Texture("Texturas/MadeiraL.jpg", scene);
        madeiraDarkMaterial.diffuseTexture.uScale = 1;
        madeiraDarkMaterial.diffuseTexture.vScale = 1;

        var madeiraBorda = new BABYLON.StandardMaterial("MadeiraBorda", scene);
        madeiraBorda.diffuseTexture = new BABYLON.Texture("Texturas/MadeiraBorda.jpg", scene);
        madeiraBorda.diffuseTexture.uScale = 1;
        madeiraBorda.diffuseTexture.vScale = 1;

        return [madeiraLightMaterial, madeiraDarkMaterial, madeiraBorda];
    }

    CriarCasa(x, y, z, material) {
        var casa = BABYLON.MeshBuilder.CreateBox('box', { height: 0.5, width: 1, depth: 1 }, this.scene);
        casa.material = material.clone();
        casa.material.id = material.id;
        casa.position.x = x;
        casa.position.y = y;
        casa.position.z = z;

        return casa;
    }

    DestruirTabuleiro() {
        for (var i = 0; i < TamTabuleiro; i++) {
            for (var j = 0; j < TamTabuleiro; j++) {
                this.tabuleiro[i][j].dispose();
            }
        }

        this.borda1.dispose();
        this.borda2.dispose();
        this.borda3.dispose();
        this.borda4.dispose();
    }
}