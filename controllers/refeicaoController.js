const { supabaseAdmin } = require('../config/supabase');

class RefeicaoController {
  
  // Criar nova refeição
  async create(req, res) {
    try {
      // Adicionado meta_calorias
      const { nome, horario, tipo_refeicao, meta_calorias } = req.body;
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
          meta_calorias: meta_calorias || 0, // Salva a meta
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

  // Listar todas as refeições
  async getAllByUser(req, res) {
    try {
      const usuario_fk = req.user.id;

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
      // Adicionado meta_calorias
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

  // Deletar
  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;

      const { error } = await supabaseAdmin
        .from('refeicoes')
        .delete()
        .eq('id', id)
        .eq('usuario_fk', usuario_fk);

      if (error) return res.status(400).json({ error: error.message });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new RefeicaoController();