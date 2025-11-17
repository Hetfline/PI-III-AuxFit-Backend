const { supabaseAdmin } = require('../config/supabase');

// Função helper para verificar se a refeição pertence ao usuário
const checkRefeicaoOwner = async (refeicaoId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('refeicoes')
    .select('id')
    .eq('id', refeicaoId)
    .eq('usuario_fk', userId)
    .single();
  return !error && data;
};

class RefeicaoItemController {

  // Adicionar item a uma refeição
  async create(req, res) {
    try {
      const { refeicao_fk, alimento_fk, quantidade, unidade_medida } = req.body;
      const usuario_fk = req.user.id;

      // VERIFICAÇÃO DE SEGURANÇA
      const isOwner = await checkRefeicaoOwner(refeicao_fk, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para modificar esta refeição' });
      }

      const { data, error } = await supabaseAdmin
        .from('refeicao_itens')
        .insert([{ refeicao_fk, alimento_fk, quantidade, unidade_medida }])
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

  // Listar todos os itens de UMA refeição
  async getAllByRefeicao(req, res) {
    try {
      const { refeicaoId } = req.params;
      const usuario_fk = req.user.id;

      // VERIFICAÇÃO DE SEGURANÇA
      const isOwner = await checkRefeicaoOwner(refeicaoId, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para ver esta refeição' });
      }

      // Usamos .select() aninhado para trazer dados do alimento
      const { data, error } = await supabaseAdmin
        .from('refeicao_itens')
        .select(`
          *,
          alimentos (*)
        `)
        .eq('refeicao_fk', refeicaoId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar um item específico
  async update(req, res) {
    try {
      const { id } = req.params; // ID do item
      const { quantidade, unidade_medida } = req.body;
      const usuario_fk = req.user.id;

      // VERIFICAÇÃO DE SEGURANÇA (Mais complexa)
      // 1. Pega o item e sua refeição
      const { data: item, error: itemError } = await supabaseAdmin
        .from('refeicao_itens')
        .select('refeicao_fk')
        .eq('id', id)
        .single();
        
      if (itemError || !item) {
          return res.status(404).json({ error: 'Item não encontrado' });
      }

      // 2. Verifica se a refeição pertence ao usuário
      const isOwner = await checkRefeicaoOwner(item.refeicao_fk, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para modificar este item' });
      }
      
      // 3. Atualiza o item
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from('refeicao_itens')
        .update({ quantidade, unidade_medida })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
          return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json(updatedData);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar um item
  async delete(req, res) {
     try {
      const { id } = req.params; // ID do item
      const usuario_fk = req.user.id;

      // Mesma verificação de segurança do UPDATE
      const { data: item, error: itemError } = await supabaseAdmin
        .from('refeicao_itens')
        .select('refeicao_fk')
        .eq('id', id)
        .single();
        
      if (itemError || !item) {
          return res.status(404).json({ error: 'Item não encontrado' });
      }

      const isOwner = await checkRefeicaoOwner(item.refeicao_fk, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para deletar este item' });
      }
      
      // Deleta o item
      const { error: deleteError } = await supabaseAdmin
        .from('refeicao_itens')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
          return res.status(400).json({ error: deleteError.message });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new RefeicaoItemController();