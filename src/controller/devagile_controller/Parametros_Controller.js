const Parametros_Services = require("../../services/devagile_services/Parametros_services");
const Controller = require("../Controller");

const parametros_Services = new Parametros_Services();
class Parametros_Controller extends Controller{



 async pegaTodosParametros_controller(req,res){
    try{
        const listaParametros = await parametros_Services.pegaTodosParametros_Services();
        return res.status(200).json(listaParametros);
    }catch(e){
        console.log(e);
        return res.status(500).json({
            message: "Erro ao buscar empresas, contate o administrador do sistema",
          });

    }
 }


}

module.exports = Parametros_Controller