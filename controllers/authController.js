const { supabase, supabaseAdmin } = require('../config/supabase');

class AuthController {
  // 1. REGISTRO SIMPLIFICADO (Apenas cria a conta)
  async register(req, res) {
    try {
      const { email, password, nome } = req.body;

      // Valida apenas o essencial agora
      if (!email || !password || !nome) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      // Cria no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome } }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ error: 'Erro ao criar usuário no Auth.' });
      }

      // Cria registro na tabela usuarios (apenas com o que temos)
      const { data: userData, error: userError } = await supabaseAdmin
        .from('usuarios')
        .insert([{
          id: authData.user.id,
          nome,
          email,
          // Os outros campos ficarão NULL automaticamente
        }])
        .select()
        .single();

      if (userError) {
        // Se falhar ao criar na tabela pública, tentar deletar o auth criado para não ficar "orfão"
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.error('Erro userError:', userError);
        return res.status(400).json({ error: 'Erro ao criar perfil do usuário no banco.' });
      }

      // Retorna o token já aqui para o usuário já sair logado!
      const { data: sessionData } = await supabase.auth.signInWithPassword({
        email, password
      });

      return res.status(201).json({
        message: 'Usuário criado!',
        user: userData,
        session: sessionData.session
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Autenticar com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Buscar dados completos do usuário
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.status(200).json({
        message: 'Login realizado com sucesso',
        session: data.session,
        user: usuario
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('Erro no logout:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter usuário atual (protegido)
  async me(req, res) {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.status(200).json({ user: usuario });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Recuperação de senha
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/reset-password'
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Email de recuperação enviado com sucesso' 
      });
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar senha
  async updatePassword(req, res) {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ error: 'Nova senha é obrigatória' });
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Senha atualizada com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // 2. NOVO MÉTODO: COMPLETAR ONBOARDING
  async completeProfile(req, res) {
    try {
      // O user ID vem do middleware de autenticação (req.user)
      // Se o middleware não estiver rodando ou o token for inválido, isso pode quebrar,
      // mas a rota está protegida, então req.user deve existir.
      const userId = req.user?.id; 

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const {
        sexo,
        data_nascimento,
        altura,
        peso_inicial,
        objetivo,
        nivel_atividade // Nota: Adicione este campo na tabela usuarios ou perfil_treino depois
      } = req.body;

      // Atualiza na tabela usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          sexo,
          data_nascimento,
          altura,
          peso_inicial,
          objetivo
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error("Erro supabase update:", error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Perfil atualizado com sucesso!', 
        user: data 
      });

    } catch (error) {
      console.error('Erro no onboarding:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

// ISSO AQUI QUE ESTAVA FALTANDO OU ESTAVA ERRADO NO SEU ARQUIVO:
module.exports = new AuthController();