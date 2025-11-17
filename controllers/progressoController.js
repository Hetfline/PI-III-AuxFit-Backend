const { supabaseAdmin } = require('../config/supabase');

class ProgressoController {
  
  // Criar novo registro de progresso
  async create(req, res) {
    try {
      const { data_registro, peso, volume_total } = req.body;
      const usuario_fk = req.user.id;

      if (!peso && !volume_total) {
        return res.status(400).json({ error: 'Pelo menos peso ou volume_total deve ser fornecido' });
      }

      const { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .insert([{ 
          data_registro, // Pode ser nulo se o default do DB for usado
          peso,
          volume_total,
          usuario_fk 
        }])
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar todos os progressos DO USUÁRIO LOGADO
  async getAllByUser(req, res) {
    try {
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .select('*')
        .eq('usuario_fk', usuario_fk)
        .order('data_registro', { ascending: false }); // Ordenar por mais recente

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  // Atualizar um registro de progresso
  async update(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;
      const { data_registro, peso, volume_total } = req.body;

      const { data, error } = await supabaseAdmin
        .from('progresso_usuario')
        .update({ data_registro, peso, volume_total })
        .eq('id', id)
        .eq('usuario_fk', usuario_fk)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
         return res.status(404).json({ error: 'Registro não encontrado' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar um registro de progresso
  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      const { error } = await supabaseAdmin
        .from('progresso_usuario')
        .delete()
        .eq('id', id)
        .eq('usuario_fk', usuario_fk);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new ProgressoController();