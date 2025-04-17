const KanbanMotivos_Services = require("../../services/devagile_services/KanbanMotivos_Services");

class KanbanMotivos_Controller {
  constructor() {
    this.kanbanMotivosService = new KanbanMotivos_Services();
  }

  // Cria um novo motivo
  async criaMotivo_Controller(req, res) {
    const dados = req.body; 
    if(!dados.setor_id|!dados.descricao |!dados.src_img){
      return res.status(500).json({ error: true, message:"Preencha todas as informações" });
    }
    
    const result = await this.kanbanMotivosService.criaMotivo_Services(dados);
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(201).json(result.motivo);
  }

  // Lista todos os motivos
  async pegaTodosMotivos_Controller(req, res) {
    const result = await this.kanbanMotivosService.pegaTodosMotivos_Services();
    if (result.error) {
      return res.status(500).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.motivos);
  }

  async pegaMotivoPorID_setor_controller(req, res) {
    try {
      const { id } = req.params; // Pegando a tag corretamente
  
      if (!id) {
        return res.status(400).json({ error: true, message: "Id não fornecida." });
      }
  
      const result = await this.kanbanMotivosService.pegaMotivoPorID_setor_Services(id);
  
      if (result.error) {
        return res.status(500).json({ error: true, message: result.message });
      }
  
      return res.status(200).json(result.motivos);
    } catch (error) {
      console.error("Erro no controlador:", error);
      return res.status(500).json({ error: true, message: "Erro interno do servidor." });
    }
  }

  // Busca um motivo pelo ID
  async pegaMotivoPorId_Controller(req, res) {
    const { id } = req.params;
    const result = await this.kanbanMotivosService.pegaMotivoPorId_Services(id);
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.motivo);
  }

  // Atualiza um motivo pelo ID
  async atualizaMotivoPorId_Controller(req, res) {

    const { id } = req.params;
    const {descricao, src_img} = req.body;

    const result = await this.kanbanMotivosService.atualizaMotivoPorId_Services(
      id,
      {descricao, src_img}
    );
    
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json(result.motivo);
  }

  // Deleta um motivo pelo ID
  async deletaMotivoPorId_Controller(req, res) {

    
    const { id } = req.params;
    const result = await this.kanbanMotivosService.deletaMotivoPorId_Services(
      id
    );
    if (result.error) {
      return res.status(404).json({ error: true, message: result.message });
    }
    return res.status(200).json({ message: result.message });
  }
}

module.exports = KanbanMotivos_Controller;
