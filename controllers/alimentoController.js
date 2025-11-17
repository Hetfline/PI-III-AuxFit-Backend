const { supabaseAdmin } = require('../config/supabase'); // Usamos admin para RLS
const { v4: uuidv4 } = require('uuid'); // Para gerar IDs, se não forem auto-increment

// NOTA: Seu schema usa 'id integer PRIMARY KEY' para alimentos.
// No Supabase, é MUITO recomendado usar 'id bigint PRIMARY KEY generated always as identity'
// ou 'id uuid PRIMARY KEY DEFAULT uuid_generate_v4()'.
// Vou assumir que o 'id' é auto-incrementado pelo Supabase (bigint).
// Se você realmente estiver usando 'integer' manual, terá que gerenciar os IDs.

class AlimentoController {
  
  // Criar novo alimento
  async create(req, res) {
    try {
      const { 
        nome, calorias, proteinas, carboidratos, gorduras, unidade_base 
      } = req.body;

      // Validação
      if (!nome || !calorias || !unidade_base) {
        return res.status(400).json({ error: 'Nome, calorias e unidade_base são obrigatórios' });
      }

      const { data, error } = await supabaseAdmin
        .from('alimentos')
        .insert([{ 
          nome, 
          calorias, 
          proteinas: proteinas || 0,
          carboidratos: carboidratos || 0,
          gorduras: gorduras || 0,
          unidade_base 
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

  // Listar todos os alimentos
  async getAll(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('alimentos')
        .select('*');

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter um alimento por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('alimentos')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Alimento não encontrado' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar um alimento
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, calorias, proteinas, carboidratos, gorduras, unidade_base, favorito } = req.body;

      const { data, error } = await supabaseAdmin
        .from('alimentos')
        .update({ 
          nome, 
          calorias, 
          proteinas, 
          carboidratos, 
          gorduras, 
          unidade_base, 
          favorito 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      
      if (!data) {
         return res.status(404).json({ error: 'Alimento não encontrado' });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar um alimento
  async delete(req, res) {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('alimentos')
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

module.exports = new AlimentoController();