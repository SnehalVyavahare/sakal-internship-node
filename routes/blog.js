const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const db = require("../data/database");
const userController = require("../controllers/users");

const router = express.Router();

router.get("/", function(req, res) {
    res.redirect("/register");
});

router.get("/login", async function(req, res) {
    res.render("login", { msg: "" });
});

router.get("/register", async function(req, res) {
    res.render("register", { msg: "" });
});


router.get('/logout', async function(req, res) {
    res.cookie("user", "logout", {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true,
    });
    res.redirect('/');
})


router.post('/login', async function(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                msg: "Please Enter your Email and Password",
                msg_type: "error"
            });
        }

        const [result] = await db.query(`select * from users where email="${email}"`)

        // console.log(result[0].password);
        // console.log(password)

        if (result.length <= 0) {
            return res.status(400).render('login', {
                msg: "User Not Found!",
                msg_type: "error"
            });
        }

        const passwordsAreEqual = await bcrypt.compare(
            //comapare unhashed value with the hashed values in database
            password,
            result[0].password,
        );
        console.log(passwordsAreEqual)

        if (!passwordsAreEqual) {
            return res.status(401).render('login', {
                msg: "Email or Password Incorrect...",
                msg_type: "error"
            });
        }

        const id = result[0].Id;
        const token = jwt.sign({ id: id }, "SHUBHAMDODE", {
            expiresIn: "90d",
        });

        console.log("Token is " + token);

        const cookieOptions = {
            expires: new Date(Date.now() + "90" * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };
        res.cookie("user", token, cookieOptions);
        res.status(200).redirect("/receivers");

        //   return res.send("Good Boyyy!")


        // else {
        //     if(!(await bcrypt.compare(password,result[0].password))){
        //     return res.status(401).render('login',{
        //         msg:"Email or Password Incorrect...",
        //         msg_type: "error"
        //    });
        // }
        //    else{
        //        res.send("Good Boyyy!")
        //    }
        // }

    } catch (error) {
        console.log(error);
    }
})

router.post("/register", async function(req, res) {
    console.log(req.body);
    const { name, email, password, confirm_password } = req.body;

    // console.log(email,name,password)

    const [result] = await db.query(`select * from users where email="${email}"`);
    console.log(result);
    if (result.length > 0) {
        return res.render("register", {
            msg: "User exists already!",
            msg_type: "error",
        });
        // return res.status(404).render("404");
    } else if (password !== confirm_password) {
        return res.render("register", {
            msg: "Password do not match!",
            msg_type: "error",
        });
    }

    let hashedPassword = await bcrypt.hash(password, 12);
    console.log(hashedPassword);

    db.query("insert into users set ?", {
        name: name,
        email: email,
        password: hashedPassword,
    });

    return res.render("register", {
        msg: "User Registration Success",
        msg_type: "good",
    });

    //   res.redirect('login');
});



router.get("/new-letter", async function(req, res) {
    const [receivers] = await db.query("select * from receivers");
    const [lettertypes] = await db.query("select * from letter_type");
    const [modes] = await db.query("select * from mode_of_transport");
    const [depts] = await db.query("select * from departments");

    res.render("new-letter", {
        receivers: receivers,
        lettertypes: lettertypes,
        modes: modes,
        depts: depts
    });
});


router.get("/send-letter", async function(req, res) {

    const [receivers] = await db.query("select * from receivers");
    const [lettertypes] = await db.query("select * from letter_type");
    const [modes] = await db.query("select * from mode_of_transport");
    const [depts] = await db.query("select * from departments");

    res.render("send-letter", {
        receivers: receivers,
        lettertypes: lettertypes,
        modes: modes,
        depts: depts
    });

    // res.render('send-letter')
})

router.get('/adddept', async function(req, res) {
    // res.send("lavdya");

    res.render("add-dept")
})
router.post('/adddept', async function(req, res) {

    await db.query("insert into departments(Dept_name) values(?)", [req.body.Dept_name]);

    res.redirect("/new-letter");
})
router.get('/addReceiver', async function(req, res) {
    // res.send("lavdya");
    const [depts] = await db.query("select * from departments");

    res.render("add-receiver", { depts: depts });
})
router.post('/addReceiver', async function(req, res) {

    const data = [
        req.body.receiver,
        req.body.contact,
        req.body.email,
        req.body.dept
    ]
    await db.query("insert into receivers(Emp_name,Contact_no,Email,Dept_id) values(?)", [data]);

    res.redirect("/new-letter");
})

router.get("/letters", async function(req, res) {
    const query = `
  select letterfrom.Letter_No, letterfrom.Sales_Org,letterfrom.Sales_Office,letterfrom.Person_name,letterfrom.Date_time,receivers.Emp_name,letter_type.Letter_Type, mode_of_transport.mode_type, letterfrom.Status from letterfrom, receivers, letter_type, mode_of_transport
  where letterfrom.Emp_id = receivers.Emp_id && letterfrom.Letter_id = letter_type.Letter_id && letterfrom.mode_id = mode_of_transport.mode_id;
  `;

    const [letters] = await db.query(query);

    res.render("letter-list", { letters: letters });
});

router.get("/receivers", userController.isLoggedIn, async function(req, res) {
    console.log(req.name);

    if (req.users) {
        const query = `
    select receivers.Emp_id, receivers.Emp_name,receivers.Contact_no,receivers.Email, departments.Dept_name from
    receivers, departments
    where receivers.Dept_id = departments.Dept_id
    `;

        const [receivers] = await db.query(query);
        res.render("receivers", { receivers: receivers, users: req.users });
    } else {
        res.redirect("/login");
    }

});

router.get("/departs", async function(req, res) {
    const query = `
  select Dept_name, IsActive from departments`;

    const [departs] = await db.query(query);
    res.render("departments", { departs: departs });
});

router.post("/letters", async function(req, res) {
    const data = [
        req.body.location,
        req.body.officename,
        req.body.sender,
        req.body.receiver,
        req.body.lettertype,
        req.body.mode
    ];

    await db.query(
        "insert into letterfrom(Sales_Org,Sales_Office,Person_name,Emp_id,Letter_id,mode_id) values(?)", [data]
    );
    res.redirect("letters");
});

router.get("/receivers/:id/edit", async function(req, res) {
    const query = `
  select * from receivers where Emp_id = ?`;

    const [receivers] = await db.query(query, [req.params.id]);
    console.log(receivers);
    const [depts] = await db.query("select * from departments");


    if (!receivers || receivers.length === 0) {
        return res.status(404).render("404");
    }

    res.render('update-receiver', { receiver: receivers[0], depts: depts })

})
router.get("/letters/:id/edit", async function(req, res) {
    const query = `
  select * from letterfrom where Letter_No = ?`;

    const [letters] = await db.query(query, [req.params.id]);
    console.log(letters);

    const [receivers] = await db.query("select * from receivers");
    const [lettertypes] = await db.query("select * from letter_type");
    const [modes] = await db.query("select * from mode_of_transport");

    if (!letters || letters.length === 0) {
        return res.status(404).render("404");
    }
    res.render("update-letter", {
        letter: letters[0],
        receivers: receivers,
        lettertypes: lettertypes,
        modes: modes,
    })
})

router.post("/receivers/:id/edit", async function(req, res) {
    const query = `
  UPDATE receivers
  set Emp_name = ?,
  Contact_no = ?,
  Email = ?,
  Dept_id = ?
  where Emp_id = ?
  `;

    await db.query(query, [
        req.body.receiver,
        req.body.contact,
        req.body.email,
        req.body.dept,
        req.params.id
    ]);

    res.redirect('/receivers');
})

router.post("/letters/:id/edit", async function(req, res) {

    const query = `
  UPDATE letterfrom
  set Sales_Org = ?,
  Sales_Office = ?,
  Person_name = ?,
  Emp_id = ?,
  Letter_id = ?,
  mode_id = ?
  where Letter_No = ?
  `;

    await db.query(query, [
        req.body.salesorg,
        req.body.salesoffice,
        req.body.sender,
        req.body.receiver,
        req.body.lettertype,
        req.body.mode,
        req.params.id,
    ])

    res.redirect("/letters");

})


module.exports = router;