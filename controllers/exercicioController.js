const { supabaseAdmin } = require('../config/supabase');

class ExercicioController {
  
  // Criar novo exercício
  async create(req, res) {
    try {
      const { nome, area_foco, descricao, execucao } = req.body;

      if (!nome || !area_foco || !descricao || !execucao) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const { data, error } = await supabaseAdmin
        .from('exercicios')
        .insert([{ nome, area_foco, descricao, execucao }])
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

  // Listar todos os exercícios
  async getAll(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('exercicios')
        .select('*');

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter um exercício por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('exercicios')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Exercício não encontrado' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar um exercício
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, area_foco, descricao, execucao } = req.body;

      const { data, error } = await supabaseAdmin
        .from('exercicios')
        .update({ nome, area_foco, descricao, execucao })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      if (!data) {
         return res.status(404).json({ error: 'Exercício não encontrado' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar um exercício
  async delete(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('exercicios')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(204).send(); // 204 No Content
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new ExercicioController();