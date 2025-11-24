const { supabaseAdmin } = require('../config/supabase');

class HistoricoTreinoController {

  // Salvar um treino finalizado (Log completo + Atualização de Progresso)
  async finishWorkout(req, res) {
    try {
      const usuario_fk = req.user.id;
      const { 
        treino_base_fk, 
        nome_treino, 
        duracao_segundos, 
        volume_total,
        exercicios 
      } = req.body;

      // 1. Inserir Cabeçalho (Historico Treino)
      const { data: historicoTreino, error: treinoError } = await supabaseAdmin
        .from('historico_treinos')
        .insert([{
          usuario_fk,
          treino_base_fk,
          nome_treino,
          duracao_segundos,
          volume_total,
          data_inicio: new Date(),
          data_fim: new Date()
        }])
        .select()
        .single();

      if (treinoError) return res.status(400).json({ error: treinoError.message });

      const historicoId = historicoTreino.id;

      // 2. Inserir Exercícios Realizados
      if (exercicios && exercicios.length > 0) {
        for (const ex of exercicios) {
          const { data: exHistory, error: exError } = await supabaseAdmin
            .from('historico_exercicios')
            .insert([{
              historico_treino_fk: historicoId,
              exercicio_fk: ex.exercicio_fk,
              series_feitas: ex.series_feitas,
              repeticoes_feitas: ex.repeticoes_feitas,
              carga_maxima: ex.carga_maxima
            }])
            .select()
            .single();

          if (exError) {
             console.error("Erro ao salvar exercício histórico:", exError);
             continue;
          }

          // 3. Inserir Sets (Se houver)
          if (ex.sets && ex.sets.length > 0) {
            const setsToInsert = ex.sets.map((set, index) => ({
              historico_exercicio_fk: exHistory.id,
              numero_serie: index + 1,
              repeticoes: set.repeticoes,
              carga: set.carga,
              rpe: set.rpe || 0
            }));

            await supabaseAdmin.from('historico_sets').insert(setsToInsert);
          }
        }
      }

      // --- 4. ATUALIZAÇÃO CRÍTICA: Salvar Volume na tabela de Progresso Diário ---
      const today = new Date().toISOString().split('T')[0];

      // Busca se já existe registro hoje
      let { data: progressoHoje } = await supabaseAdmin
        .from('progresso_usuario')
        .select('id, volume_total')
        .eq('usuario_fk', usuario_fk)
        .eq('data_registro', today)
        .maybeSingle();

      if (progressoHoje) {
        // Se já existe, SOMA o volume novo ao anterior (ex: treinou de manhã e de tarde)
        const novoVolume = (Number(progressoHoje.volume_total) || 0) + Number(volume_total);
        
        await supabaseAdmin
            .from('progresso_usuario')
            .update({ volume_total: novoVolume })
            .eq('id', progressoHoje.id);
            
      } else {
        // Se não existe registro hoje, busca o último peso para não criar zerado
        const { data: lastWeight } = await supabaseAdmin
            .from('progresso_usuario')
            .select('peso')
            .eq('usuario_fk', usuario_fk)
            .order('data_registro', { ascending: false })
            .limit(1)
            .maybeSingle();

        const pesoAtual = lastWeight ? lastWeight.peso : 0;

        // Cria o registro do dia com o volume do treino
        await supabaseAdmin
            .from('progresso_usuario')
            .insert([{
                usuario_fk,
                data_registro: today,
                volume_total: volume_total,
                peso: pesoAtual,
                agua_ml: 0
            }]);
      }
      // -----------------------------------------------------------------------

      return res.status(201).json({ message: "Treino salvo e progresso atualizado!", id: historicoId });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao salvar histórico.' });
    }
  }

  // Obter histórico
  async getHistory(req, res) {
    try {
      const usuario_fk = req.user.id;
      const { data, error } = await supabaseAdmin
        .from('historico_treinos')
        .select(`
            *,
            historico_exercicios (
                id,
                series_feitas,
                carga_maxima,
                exercicios (nome_exercicio, imagem_url)
            )
        `)
        .eq('usuario_fk', usuario_fk)
        .order('data_fim', { ascending: false });

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno.' });
    }
  }
}

module.exports = new HistoricoTreinoController();