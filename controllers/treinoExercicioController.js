const { supabaseAdmin } = require('../config/supabase');

// Função helper
const checkTreinoOwner = async (treinoId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('treinos')
    .select('id')
    .eq('id', treinoId)
    .eq('usuario_fk', userId)
    .single();
  return !error && data;
};

class TreinoExercicioController {

  // Adicionar exercício a um treino
  async create(req, res) {
    try {
      const { treino_fk, exercicio_fk, series, repeticoes, carga, descanso_segundos } = req.body;
      const usuario_fk = req.user.id;

      const isOwner = await checkTreinoOwner(treino_fk, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para modificar este treino' });
      }

      const { data, error } = await supabaseAdmin
        .from('treino_exercicios')
        .insert([{ treino_fk, exercicio_fk, series, repeticoes, carga, descanso_segundos }])
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

  // Listar todos os exercícios de UM treino
  async getAllByTreino(req, res) {
    try {
      const { treinoId } = req.params;
      const usuario_fk = req.user.id;

      const isOwner = await checkTreinoOwner(treinoId, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para ver este treino' });
      }

      // Traz dados do exercício aninhado
      const { data, error } = await supabaseAdmin
        .from('treino_exercicios')
        .select(`
          *,
          exercicios (*)
        `)
        .eq('treino_fk', treinoId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar um exercício específico (series, reps, etc)
  async update(req, res) {
    try {
      const { id } = req.params; // ID do treino_exercicio
      const { series, repeticoes, carga, descanso_segundos } = req.body;
      const usuario_fk = req.user.id;

      // Verificação de segurança
      const { data: item, error: itemError } = await supabaseAdmin
        .from('treino_exercicios')
        .select('treino_fk')
        .eq('id', id)
        .single();
        
      if (itemError || !item) {
          return res.status(404).json({ error: 'Exercício do treino não encontrado' });
      }

      const isOwner = await checkTreinoOwner(item.treino_fk, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para modificar este item' });
      }
      
      // Atualiza
      const { data: updatedData, error: updateError } = await supabaseAdmin
        .from('treino_exercicios')
        .update({ series, repeticoes, carga, descanso_segundos })
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

  // Deletar um exercício do treino
  async delete(req, res) {
     try {
      const { id } = req.params; // ID do treino_exercicio
      const usuario_fk = req.user.id;

      // Verificação de segurança
      const { data: item, error: itemError } = await supabaseAdmin
        .from('treino_exercicios')
        .select('treino_fk')
        .eq('id', id)
        .single();
        
      if (itemError || !item) {
          return res.status(404).json({ error: 'Exercício do treino não encontrado' });
      }

      const isOwner = await checkTreinoOwner(item.treino_fk, usuario_fk);
      if (!isOwner) {
        return res.status(403).json({ error: 'Você não tem permissão para deletar este item' });
      }
      
      // Deleta
      const { error: deleteError } = await supabaseAdmin
        .from('treino_exercicios')
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

module.exports = new TreinoExercicioController();