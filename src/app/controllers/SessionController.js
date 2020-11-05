const crypto = require('crypto')
const { hash } = require('bcryptjs')
const mailer = require('../../lib/mailer')
const User = require('../models/user')

module.exports = {
  loginForm(req, res) {
    return res.render("session/login")
  },
  login(req, res) {
    req.session.userId = req.user.id

    return res.redirect("/users")
  },
  logout(req, res) {
    req.session.destroy()
    return res.redirect("/")
  },
  forgotForm(req, res) {
    return res.render("session/forgot-password")
  },
  async forgot(req, res) {
    const user = req.user
    try {
      // criar token
      const token = crypto.randomBytes(20).toString("hex")
      // criar expiração do token
      let now = new Date()
      now = now.setHours(now.getHours() +1)

      await User.update(user.id, {
        reset_token: token,
        reset_token_expires: now
      })
      // enviar um email com link de recuperação de senha
      await mailer.sendMail({
        to: user.email,
        from: 'no-reply@launchstore.com.br',
        subject: 'recuperação de senha',
        html: `<h2>Perdeu a chave?</h2>
        <p>Não se preocupe, clique no link abaixo para recupera-la</p>
        <p>
          <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
            RECUPERAR SENHA
          </a>
        </p>
        `,
      })
      // avisar user do envio do email
      return res.render("session/forgot-password", {
      sucess: "Verifique seu e-mail para reset de sua senha!"
    })
    } catch(err) {
      console.error(err)
      return res.render("session/forgot-password", {
        error: "erro inesperado, try again"
      })
    }
  },
  resetForm(req, res) {
    return res.render("session/password-reset", { token: req.query.token })
  },
  async reset(req, res) {
    const user = req.user
    const { password, token } = req.body
    try {
      // criar novo hash de senha
      const newPassword = await hash(password, 8)
      // atualiza o user
      await User.update(user.id, {
        password: newPassword,
        reset_token: "",
        reset_token_expires: "",
      })
      // notifica o user da new password
      return res.render("session/login", {
        user: req.body,
        sucess: "senha atualizada"
      })

    } catch(err) {
      console.error(err)
      return res.render("session/password-reset", {
        user: req.body,
        token,
        error: "Erro inesperado, tente novamente!"
      })
    }
  }
}