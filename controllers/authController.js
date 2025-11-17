const { supabase, supabaseAdmin } = require('../config/supabase');

class AuthController {
  // Registro de novo usuário
  async register(req, res) {
    try {
      const {
        email,
        password,
        nome,
        sexo,
        data_nascimento,
        altura,
        peso_inicial,
        objetivo
      } = req.body;

      // Validações básicas
      if (!email || !password || !nome || !sexo || !data_nascimento || !altura || !peso_inicial || !objetivo) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!['M', 'F', 'Outro'].includes(sexo)) {
        return res.status(400).json({ error: 'Sexo inválido' });
      }

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome } // Metadados opcionais
        }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // 2. Criar registro na tabela usuarios usando o UUID do auth
      const { data: userData, error: userError } = await supabaseAdmin
        .from('usuarios')
        .insert([{
          id: authData.user.id, // UUID do Supabase Auth
          nome,
          email,
          sexo,
          data_nascimento,
          altura,
          peso_inicial,
          objetivo
        }])
        .select()
        .single();

      if (userError) {
        // Se falhar ao criar o usuário, tentar deletar o auth criado
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return res.status(400).json({ error: 'Erro ao criar perfil do usuário' });
      }

      return res.status(201).json({
        message: 'Usuário criado com sucesso! Verifique seu email para confirmar.',
        user: {
          id: userData.id,
          nome: userData.nome,
          email: userData.email
        }
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
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          sexo: usuario.sexo,
          objetivo: usuario.objetivo
        }
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
        redirectTo: 'http://localhost:3000/reset-password' // Ajuste conforme necessário
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
}

module.exports = new AuthController();