const jwt = require('jsonwebtoken');
const ex = require('express');
const cookieParser = require('cookie-parser');
const app = ex();
const bodyParser = require('body-parser');
const session = require("express-session");
const mysql = require('mysql');
const { fileLoader } = require('ejs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;

const SECRET_KEY = "ВАШ ТОКЕН";

app.set('view engine', 'ejs');
app.use(ex.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

function getGravatarUrl(email, size = 80) {
    const trimmedEmail = email.trim().toLowerCase();
    const hash = crypto.createHash('sha256').update(trimmedEmail).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ' + err.stack);
    return;
  }
  console.log('Подключено к базе данных как id ' + connection.threadId);
});

const sessionHandler = (req, res, next) => {
  res.locals.error = req.session.error;
  res.locals.kind = req.session.kind;
  res.locals.input = req.session.input;
  res.locals.values = req.session.values;

  req.session.error = null;
  req.session.kind = null;
  req.session.input = null;
  req.session.values = null;

  const token = req.cookies.authToken;
  
  if (!token) {
    res.setHeader('Cache-Control', 'no-store');
    res.locals.logined_user = null;
    return next();
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      res.locals.logined_user = null;
      return next();
    }

    connection.query(
      'SELECT * FROM users WHERE login = ? UNION ALL SELECT * FROM users WHERE email = ? AND NOT EXISTS (SELECT 1 FROM users WHERE login = ?);', 
      [user.login, user.login, user.login], 
      (error, users) => {
        if (error || users.length === 0) {
          res.locals.logined_user = null;
        } else {
          users[0].img = getGravatarUrl(users[0].email, 200);
          res.locals.logined_user = users[0];
        }
        next();
      }
    );
  });
};
app.use(sessionHandler);




app.get("/", (req, res) => {
  return res.render("index", { logined_user: res.locals.logined_user, error:res.locals.error, kind:res.locals.kind, input:res.locals.input, values:res.locals.values });
});

app.post('/register', (req, res) => {
  const { login, email, password, rePassword, ref, personal, terms } = req.body;
  let param = req.query.param;
  if (!param) {
    param = '';
  }

  function TestNaDovboyoba(str) {
    return str.length === 0 || /^\s*$/.test(str);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  connection.query('SELECT * FROM users WHERE login = ?', [login], (error, users) => {
    connection.query('SELECT * FROM users WHERE email = ?', [email], (error, emails) => {
      if (error) throw error;

      if (TestNaDovboyoba(login)) {
        req.session.error = "Логин не может быть пустым";
        req.session.kind = 'register';
        req.session.input = 'login';
        req.session.values = { email: email, password:password, ref:ref };
        return res.redirect(`/${param}`);
      } else if (login.length <= 3 || login.length > 32) {
        req.session.error = "Логин должен быть менее 3 и более 32 символов";
        req.session.kind = 'register';
        req.session.input = 'login';
        req.session.values = { email: email, password:password, ref:ref };
        return res.redirect(`/${param}`);
      } else if (users.length != 0) {
        req.session.error = "Логин занят";
        req.session.kind = 'register';
        req.session.input = 'login';
        req.session.values = { email: email, password:password, ref:ref };
        return res.redirect(`/${param}`);
      } else if (login.includes(" ")) {
        req.session.error = "Логин не должен содержать пробелы";
        req.session.kind = 'register';
        req.session.input = 'login';
        req.session.values = { email: email, password:password, ref:ref };
        return res.redirect(`/${param}`);

      } else if (TestNaDovboyoba(email)) {
        req.session.error = "Адрес электронной почты не может быть пустым";
        req.session.kind = 'register';
        req.session.input = 'email';
        req.session.values = { login: login, password:password, ref:ref };
        return res.redirect(`/${param}`);
      } else if (!validateEmail(email)) {
        req.session.error = "Адрес электронной почты некорректен";
        req.session.kind = 'register';
        req.session.input = 'email';
        req.session.values = { login: login, password:password, ref:ref };
        return res.redirect(`/${param}`);
      } else if (emails.length != 0) {
        req.session.error = "Адрес электронной почты занят";
        req.session.kind = 'register';
        req.session.input = 'email';
        req.session.values = { login: login, password:password, ref:ref };
        return res.redirect(`/${param}`);

      } else if (TestNaDovboyoba(password)) {
        req.session.error = "Пароль не может быть пустым";
        req.session.kind = 'register';
        req.session.input = 'password';
        req.session.values = { email: email, login:login, ref:ref };
        return res.redirect(`/${param}`);
      } else if (password.length <= 8) {
        req.session.error = "Пароль должен быть менее 8 символов";
        req.session.kind = 'register';
        req.session.input = 'password';
        req.session.values = { email: email, login:login, ref:ref };
        return res.redirect(`/${param}`);

      } else if (rePassword != password) {
        req.session.error = "Пароли не совпадают";
        req.session.kind = 'register';
        req.session.input = 'rePassword';
        req.session.values = { email: email, login:login, password:password, ref:ref };
        return res.redirect(`/${param}`);
      } else if (!personal || !terms) {
        req.session.error = "Вы не согласились со всеми правилами";
        req.session.kind = 'register';
        req.session.input = 'personal & terms';
        req.session.values = { email: email, login:login, password:password, ref:ref };
        return res.redirect(`/${param}`);
      } else {
        bcrypt.hash(password, saltRounds, (err, password_hash) => {
          if (err) {
            if (error) throw error;
          } else {
            connection.query("INSERT INTO `users`(`login`, `email`, `password`, `referal`) VALUES (?,?,?,?)", [login, email, password_hash, ref], (error, emails) => {
              if (error) throw error;
              req.session.error = 'login plz';
              req.session.kind = 'login';
              req.session.input = null;
              req.session.values = null;
              res.redirect(`/${param}`);
            });
          }
        });
      }
    });
  });
});
app.post('/login', (req, res) => {
  const { login, password, personal, terms } = req.body;
  let param = req.query.param;
  if (!param) {
    param = '';
  }


  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  if (validateEmail(login)) {
    connection.query('SELECT * FROM `users` WHERE email = ?', [login], (error, user) => {
      if (error) throw error;
      if (user.length == 0) {
        req.session.error = "Пользователь не найден";
        req.session.kind = 'login';
        req.session.input = 'login';
        req.session.values = null;
        return res.redirect(`/${param}`);
      } else if (!personal || !terms) {
        req.session.error = "Вы не согласились со всеми правилами";
        req.session.kind = 'login';
        req.session.input = 'personal & terms';
        req.session.values = { login:login, password:password };
        return res.redirect(`/${param}`);
      } else if (user.length == 1) {
        bcrypt.compare(password, user[0].password, (err, result) => {
          if (err) {
            console.error('Error compare passwords:', err);
          } else if (result) {
            const loged_user = { login: user[0].login, email: user[0].email, password: password }
            const token = jwt.sign(loged_user, SECRET_KEY, { expiresIn: '2d' });
            res.cookie('authToken', token, {
              httpOnly: true,
              secure: true,
              sameSite: 'None',
              maxAge: 48 * 60 * 60 * 1000
            });
            req.session.error = null;
            req.session.kind = null;
            req.session.input = null;
            req.session.values = null;
            res.redirect(`/${param}`);
          } else {
            req.session.error = 'Неверный пароль';
            req.session.kind = 'login';
            req.session.input = 'password';
            req.session.values = { login:login };
            res.redirect(`/${param}`);
          }
        });
      } else {
        res.redirect(`/${param}`);
      }
    });
  } else {
    connection.query('SELECT `password` FROM `users` WHERE login = ?', [login], (error, passwords) => {
      if (error) throw error;
      if (passwords.length == 0) {
        req.session.error = "Пользователь не найден";
        req.session.kind = 'login';
        req.session.input = 'login';
        req.session.values = null;
        return res.redirect(`/${param}`);
      } else if (!personal || !terms) {
        req.session.error = "Вы не согласились со всеми правилами";
        req.session.kind = 'login';
        req.session.input = 'personal & terms';
        req.session.values = { login:login, password:password };
          return res.redirect(`/${param}`);
      } else if (passwords.length == 1) {
        bcrypt.compare(password, passwords[0].password, (err, result) => {
          if (err) {
            console.error('Error compare passwords:', err);
          } else if (result) {
            const user = { login: login, password: password }
            const token = jwt.sign(user, SECRET_KEY, { expiresIn: '2d' });
            res.cookie('authToken', token, {
              httpOnly: true,
              secure: true,
              sameSite: 'None',
              maxAge: 48 * 60 * 60 * 1000
            });
            req.session.error = null;
            req.session.kind = null;
            req.session.input = null;
            req.session.values = null;
            res.redirect(`/${param}`);
          } else {
            req.session.error = 'Неверный пароль';
            req.session.kind = 'login';
            req.session.input = 'password';
            req.session.values = { login:login };
            res.redirect(`/${param}`);
          }
        });
      } else {
        res.redirect(`/${param}`);
      }
    });
  }
});
app.get('/logout', (req, res) => {
  res.cookie('authToken', '', { expires: new Date(0) });
  let param = req.query.param;
  if (!param) {
    param = '';
  }
  req.session.error = null;
  req.session.kind = null;
  req.session.input = null;
  req.session.values = null;
  res.redirect(`/${param}`);
});




app.get("/support", (req, res) => {
  return res.render("support", { logined_user: res.locals.logined_user, error:res.locals.error, kind:res.locals.kind, input:res.locals.input, values:res.locals.values });
});

app.get("/statements", (req, res) => {
  if (!res.locals.logined_user) {
    return res.redirect("/");
  }
  return res.render("statements", { logined_user: res.locals.logined_user, error:res.locals.error, kind:res.locals.kind, input:res.locals.input, values:res.locals.values });
});

app.get("/documents", (req, res) => {
  if (!res.locals.logined_user) {
    return res.redirect("/");
  }
  return res.render("documents", { logined_user: res.locals.logined_user, error:res.locals.error, kind:res.locals.kind, input:res.locals.input, values:res.locals.values });
});


app.use((req, res) => {
  return res.status(404).render("404", { logined_user: res.locals.logined_user, error:res.locals.error, kind:res.locals.kind, input:res.locals.input, values:res.locals.values });
});

const PORT = 8008;
app.listen(PORT, () => {
  console.log(`Server start: http://localhost:${PORT}`);
});
