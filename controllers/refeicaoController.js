const { supabaseAdmin } = require('../config/supabase');

class RefeicaoController {
  
  // Criar nova refeição (Diário)
  async create(req, res) {
    try {
      const { nome, horario, tipo_refeicao, meta_calorias, data_registro } = req.body;
      const usuario_fk = req.user.id;

      if (!nome || !tipo_refeicao) {
        return res.status(400).json({ error: 'Nome e tipo de refeição são obrigatórios' });
      }

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .insert([{ 
          nome, 
          horario, 
          tipo_refeicao,
          meta_calorias: meta_calorias || 0,
          data_registro: data_registro || new Date(), // Usa a data enviada ou HOJE
          usuario_fk 
        }])
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar refeições (Filtradas por DATA)
  async getAllByUser(req, res) {
    try {
      const usuario_fk = req.user.id;
      // Pega a data da query string (?date=2024-11-24) ou usa hoje
      const dateFilter = req.query.date || new Date().toISOString().split('T')[0];

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .select(`
          *,
          refeicao_itens (
            id,
            quantidade,
            unidade_medida,
            alimentos (
              id,
              nome,
              calorias,
              proteinas,
              carboidratos,
              gorduras,
              unidade_base
            )
          )
        `)
        .eq('usuario_fk', usuario_fk)
        .eq('data_registro', dateFilter) // IMPORTANTE: Filtra pelo dia!
        .order('id', { ascending: true });

      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter uma refeição por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .select(`
          *,
          refeicao_itens (
            id,
            quantidade,
            unidade_medida,
            alimentos (*)
          )
        `)
        .eq('id', id)
        .eq('usuario_fk', usuario_fk)
        .single();

      if (error || !data) return res.status(404).json({ error: 'Refeição não encontrada' });

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar
  async update(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;
      const { nome, horario, tipo_refeicao, meta_calorias } = req.body;

      const { data, error } = await supabaseAdmin
        .from('refeicoes')
        .update({ nome, horario, tipo_refeicao, meta_calorias })
        .eq('id', id)
        .eq('usuario_fk', usuario_fk)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      if (!data) return res.status(404).json({ error: 'Refeição não encontrada' });

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar (CORRIGIDO)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      // 1. Primeiro deleta os itens dentro da refeição (filhos)
      const { error: itemsError } = await supabaseAdmin
        .from('refeicao_itens')
        .delete()
        .eq('refeicao_fk', id);

      if (itemsError) {
        console.error("Erro ao deletar itens da refeição:", itemsError);
        return res.status(400).json({ error: 'Não foi possível limpar os itens da refeição.' });
      }

      // 2. Agora deleta a refeição (pai)
      const { error } = await supabaseAdmin
        .from('refeicoes')
        .delete()
        .eq('id', id)
        .eq('usuario_fk', usuario_fk);

      if (error) return res.status(400).json({ error: error.message });

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new RefeicaoController();