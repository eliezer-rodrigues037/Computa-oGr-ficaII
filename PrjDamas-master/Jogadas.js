class Jogadas{
    constructor(objetivo){
        this.objetivo = objetivo;
        this.pecasRemovidas = [];
        this.listaMovimentos = [this.objetivo];
    }

    clone(){
        let jogClone = new Jogadas(this.objetivo.clone());
        jogClone.pecasRemovidas = this.pecasRemovidas.slice();
        jogClone.listaMovimentos = this.listaMovimentos.slice();

        return jogClone;
    }
}