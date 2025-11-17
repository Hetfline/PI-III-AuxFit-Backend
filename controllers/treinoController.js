const { supabaseAdmin } = require('../config/supabase');

class TreinoController {
  
  // Criar novo treino PARA O USUÁRIO LOGADO
  async create(req, res) {
    try {
      const { nome, areas_foco, duracao, ativo } = req.body;
      const usuario_fk = req.user.id;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const { data, error } = await supabaseAdmin
        .from('treinos')
        .insert([{ 
          nome, 
          areas_foco,
          duracao,
          ativo,
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

  // Listar todos os treinos DO USUÁRIO LOGADO
  async getAllByUser(req, res) {
    try {
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('treinos')
        .select('*')
        .eq('usuario_fk', usuario_fk);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter um treino por ID (E DO USUÁRIO LOGADO)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('treinos')
        .select('*')
        .eq('id', id)
        .eq('usuario_fk', usuario_fk)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar um treino (DO USUÁRIO LOGADO)
  async update(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;
      const { nome, areas_foco, duracao, ativo } = req.body;

      const { data, error } = await supabaseAdmin
        .from('treinos')
        .update({ nome, areas_foco, duracao, ativo })
        .eq('id', id)
        .eq('usuario_fk', usuario_fk)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
         return res.status(404).json({ error: 'Treino não encontrado ou não pertence a você' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar um treino (DO USUÁRIO LOGADO)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      const { error } = await supabaseAdmin
        .from('treinos')
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

module.exports = new TreinoController();