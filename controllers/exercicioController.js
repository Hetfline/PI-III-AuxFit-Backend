const { supabaseAdmin } = require('../config/supabase');

class ExercicioController {
  
  // Criar novo exercício
  async create(req, res) {
    try {
      // Ajustado para as colunas do NOVO SCHEMA
      const { 
        nome_exercicio, 
        grupo_muscular_geral, 
        grupo_muscular_especifico, 
        video_url, 
        imagem_url, 
        descricao, 
        execucao_passos 
      } = req.body;

      if (!nome_exercicio || !grupo_muscular_geral) {
        return res.status(400).json({ error: 'Nome e Grupo Muscular Geral são obrigatórios' });
      }

      const { data, error } = await supabaseAdmin
        .from('exercicios')
        .insert([{ 
            nome_exercicio, 
            grupo_muscular_geral, 
            grupo_muscular_especifico, 
            video_url, 
            imagem_url, 
            descricao, 
            execucao_passos
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

  // Listar todos os exercícios
  async getAll(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('exercicios')
        .select('*')
        .order('nome_exercicio', { ascending: true }); // Ordenar por nome

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

  // Atualizar e Deletar mantêm a mesma lógica, apenas atente-se aos nomes das colunas no Update se for implementar agora.
  // Por brevidade, foquei no GET e POST que vamos usar.
  async delete(req, res) {
     // ... (mantenha a lógica anterior, ajustando se necessário)
     try {
        const { id } = req.params;
        const { error } = await supabaseAdmin.from('exercicios').delete().eq('id', id);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(204).send();
     } catch (error) {
        return res.status(500).json({ error: 'Erro interno' });
     }
  }
  
  async update(req, res) {
      // ... Implemente se necessário usando os campos novos (nome_exercicio, etc)
      return res.status(501).json({ error: 'Não implementado neste exemplo rápido' });
  }
}

module.exports = new ExercicioController();