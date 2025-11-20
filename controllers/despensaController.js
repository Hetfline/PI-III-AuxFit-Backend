const { supabaseAdmin } = require('../config/supabase');

class DespensaController {
  
  // Listar itens da despensa do usuário
  async get(req, res) {
    try {
      const usuario_fk = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('despensa_itens')
        .select(`
          *,
          alimentos (
            id,
            nome,
            calorias,
            proteinas,
            carboidratos,
            gorduras,
            unidade_base
          )
        `)
        .eq('usuario_fk', usuario_fk);

      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Adicionar item à despensa
  async add(req, res) {
    try {
      const usuario_fk = req.user.id;
      const { alimento_fk, quantidade, unidade_medida } = req.body;

      // Verifica se já existe na despensa para evitar duplicados (opcional, mas recomendado)
      const { data: existing } = await supabaseAdmin
        .from('despensa_itens')
        .select('id')
        .eq('usuario_fk', usuario_fk)
        .eq('alimento_fk', alimento_fk)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Este item já está na sua despensa.' });
      }

      const { data, error } = await supabaseAdmin
        .from('despensa_itens')
        .insert([{ 
          usuario_fk, 
          alimento_fk, 
          quantidade: quantidade || 1, 
          unidade_medida: unidade_medida || 'un'
        }])
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar quantidade
  async update(req, res) {
    try {
      const { id } = req.params;
      const usuario_fk = req.user.id;
      const { quantidade, unidade_medida } = req.body;

      const { data, error } = await supabaseAdmin
        .from('despensa_itens')
        .update({ quantidade, unidade_medida })
        .eq('id', id)
        .eq('usuario_fk', usuario_fk) // Garante que só o dono edita
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Remover da despensa
  // Pode remover pelo ID da relação (mais seguro) ou pelo ID do alimento
  async delete(req, res) {
    try {
      const { id } = req.params; // ID da despensa_itens
      const usuario_fk = req.user.id;

      const { error } = await supabaseAdmin
        .from('despensa_itens')
        .delete()
        .eq('id', id)
        .eq('usuario_fk', usuario_fk);

      if (error) return res.status(400).json({ error: error.message });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Rota especial: Checar se um alimento específico está na despensa (útil para o botão de coração/geladeira)
  async checkItem(req, res) {
    try {
        const { alimentoId } = req.params;
        const usuario_fk = req.user.id;

        const { data, error } = await supabaseAdmin
            .from('despensa_itens')
            .select('*')
            .eq('usuario_fk', usuario_fk)
            .eq('alimento_fk', alimentoId)
            .maybeSingle(); // Retorna null se não achar, sem dar erro

        if (error) return res.status(400).json({ error: error.message });

        return res.status(200).json({ inPantry: !!data, item: data });
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno' });
    }
  }
}

module.exports = new DespensaController();