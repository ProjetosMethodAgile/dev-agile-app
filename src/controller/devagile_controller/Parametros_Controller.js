const Parametros_Services = require("../../services/devagile_services/Parametros_services");
const Controller = require("../Controller");
const Empresa_Services = require("../../services/devagile_services/Empresa_Services") 
const Permissao_Services = require("../../services/devagile_services/Permissao_Services") 
const parametros_services = new Parametros_Services();
const  empresa_services = new Empresa_Services();
const permissao_services = new Permissao_Services();
const camposObrigatorios = ["nome", "empresa_id", "descricao","tipo_id"];

class Parametros_Controller extends Controller{
    constructor() {
        super(parametros_services, camposObrigatorios);
      }

 async pegaTodosParametros_controller(req,res){
    try{
        const listaParametros = await parametros_services.pegaTodosParametros_Services();
        return res.status(200).json(listaParametros);
    }catch(e){
        console.log(e);
        return res.status(500).json({
            message: "Erro ao buscar empresas, contate o administrador do sistema",
        });
 
    }
}
 async pegaParametrosEmpresa_controller(req,res){

    const {id}= req.body

    try{
        const listaParametros = await parametros_services.pegaParametrosEmpresa_Services(id);
        return res.status(200).json(listaParametros);
    }catch(e){
        console.log(e);
        return res.status(500).json({
            message: "Erro ao buscar empresas, contate o administrador do sistema",
        });
 
    }
}

async criaParametros_controller(req, res) {
    const isTrue = await this.allowNull(req, res);
    try {
        if (isTrue.status) {
            const { nome, empresa_id,descricao,tipo_id } = req.body;
            const empresaValida = await empresa_services.pegaEmpresaPorId_Services(empresa_id)
            const tipoParametro =  await  permissao_services.pegaPermissaoPorId_Services(tipo_id)
            if (!empresaValida ||!tipoParametro) {
                return res.status(400).json({  message: "Erro ao criar parametro, contate o administrador do sistem" ,error: true})
            }
            const cadastraParametros = await parametros_services.criaParametros_Services(nome,empresa_id,descricao,tipo_id)
                       
            if (cadastraParametros.error) {
            return res.status(400).json({ message: cadastraParametros.message ? cadastraParametros.message: "Erro ao criar parametro, contate o administrador do sistem",error: true})
            }
            return res.status(200).json({ parametro:cadastraParametros.parametro,  message: "Cadastro realizado com sucesso" });
        }else { 
            return res.status(500).json({
                message: "Preencha todos os campos necessários",
                campos: isTrue.campos,
                error: true
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(400).json({
            error:true,
            message: "Erro ao criar empresa, contate o administrador do sistem",
        });
    }
}
async deletaParametrosporID_controller(req,res){
    const {id} = req.body
    try{
        const parametroDeletado = await parametros_services.deletaParametro_Services(id);
        return res.status(200).json(parametroDeletado);
    }catch(e){
        console.log(e);
        return res.status(500).json({
            message: "Erro ao buscar parametro, contate o administrador do sistema",
        });
        
    }
    
}
async atualizaParametroPorNome(req,res){
    const {nome,descricao,tipo_id,id} = req.body;
    const idExistente = parametros_services.pegaIdParametro_Services(id)
    if (!idExistente || idExistente == null) {
        return res.status(500).json({
            message:
              "Erro ao atualizar parametro, contate o administrador do sistema",
          });
    }
    try {
      const parametrosAtualizado =
        await parametros_services.atualizaParametros_Services(id, {
          nome,
          descricao,
          tipo_id
        });
      if (!parametrosAtualizado) {
        return res
          .status(404)
          .json({ message: `Parametro não encontrada` });
      }
      return res.status(200).json({
        message: `Parametro atualizada com sucesso`,
        parametrosAtualizado,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message:
          "Erro ao atualizar empresa, contate o administrador do sistema",
      });
    }
}
}

module.exports = Parametros_Controller