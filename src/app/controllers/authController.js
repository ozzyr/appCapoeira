const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth');
const User = require('../models/user');
const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign({ params }, authConfig.secret, {
        expiresIn: 86400,
    });
}
// rota registro
router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ erros: 'Email ja é cadastrado' });

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user.id }),
        });

    } catch (err) {
        return res.status(400).send({ error: 'registro falhou' });
    }
});
// rota de autenticação
router.post('/autenticate', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user)
        return res.status(400).send({ error: 'usuario não encontrado' });

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({ erro: 'Senha invalida' });

    user.password = undefined;
    res.send({
        user,
        token: generateToken({ id: user.id }),
    });

});
//rota recuperação de senha
router.post('/forgot_password', async (req, res) => {

    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours(+ 1));

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: "maxozzyr@gmail.com",
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            if (err)
                res.status(400).send({ error: 'cannot send forgot password' });
            return res.status(200).send({ msg: "deu certo" });
        })


    } catch (err) {
        res.status(400).send({ error: 'Erro on forgot password, try again' });
        console.log(err);

    }
});

router.post('/reset_password', async (req, res) => {
    const { email, password, token } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if (!user)
            res.status(400).send({ error: "user not found" });

        if (token !== user.passwordResetToken)
            res.status(400).send({ error: "token expires or token not valid " });

        const now = new Date();
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: "token expires or token not valid" });

        user.password = password;

        await user.save();

        res.send({ ok: "password has been changed successfully" })

    } catch (err) {
        console.log(err)
        res.status(400).send({ error: "error on changing password" });
    }

});

module.exports = app => app.use('/auth', router);