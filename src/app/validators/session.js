const User = require('../models/user')
const { compare } = require('bcryptjs')

async function login(req, res, next) {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if(!user) return res.render("session/login", {
    user: req.body,
    error: "usuário não cadastrado"
  })

  const passed = await compare(password, user.password)

  if(!passed) return res.render("session/login", {
    user: req.body,
    error: "senha incorreta"
  })

  req.user = user
  next()
}

async function forgot(req, res, next) {
  const {email} = req.body

  try {
    let user = await User.findOne({ where: { email } })

    if (!user) return res.render("session/forgot-password", {
      user: req.body,
      error: "E-mail não cadastrado!"
    })

    req.user = user

    next()

  } catch(err) {
    console.error(err)
  }
}

async function reset(req, res, next) {
  // procurar user 
  const { email, password, token, passwordRepeat } = req.body

  const user = await User.findOne({ email })

  if(!user) return res.render("session/password-reset", {
    user: req.body,
    token,
    error: "usuário não cadastrado"
  })
  // password match?
  if (password != passwordRepeat) return res.render('session/password-reset', {
    user: req.body,
    token,
    error: 'Senha diferente'
  })
  // token match?
  if(token != user.reset_token) return res.render('session/password-reset', {
    user: req.body,
    token,
    error: "token invalido, solicite uma nova recuperação de senha"
  })
  // token expire?
  let now = new Date()
  now = now.setHours(now.getHours())
  if (now > user.reset_token_expires) return res.render('session/password-reset', {
    user: req.body,
    token,
    error: "token expirado, solicite uma nova recuperação de senha"
  })

  req.user = user
  next()
}

module.exports = {
  login,
  forgot,
  reset
}