import express from "express";
import { body, header } from "express-validator";
import bycript from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { find, findWithVerify, insertUser, replaceOne, isIn } from "./dbUsers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { showErrors, sshKey, isAuth} from "./utils";

const router = express.Router();

export const saltRounds = 10;

router.post("/signup", body("name").notEmpty().isString(), body("surname").notEmpty().isString(), body("password").notEmpty().isString().isLength({min: 8}), body("email").notEmpty().isString().isEmail(),
    showErrors, async ({ body }, res) => {
    body.password = await bycript.hash(body.password, saltRounds);
    body.verify = uuidv4();

    let user = await insertUser(body);
    if(user === -1) return res.status(500).json({message: "server error..."});
    if(user === -2) return res.status(409).json({message: "Insert err..."});
    if(typeof user !== "number"){
        console.log(user.verify);
        res.status(201).json({id: user.id, name: user.name, surname: user.surname, email: user.email});
    }
});

router.post("/login", body("email").notEmpty().isString().isEmail(), body("password").notEmpty().isString(), showErrors, async ({body}, res) => {
    const user = await find(body.email);
    if(typeof user === "number") return res.status(500).json({message: "server error..."});
    if(!user || user.verify) res.status(401).json({message: "user not found..."});
    else if(!await bycript.compare(body.password, user.password)) res.status(401).json({message: "wrong password..."});
    else { 
        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            token: ""
        }
        userWithoutPassword.token = jwt.sign(userWithoutPassword, sshKey);
        res.json(userWithoutPassword);
    }
});

router.get("/validate/:token", async ({params}, res) => {
    const user = await findWithVerify(params.token);
    if(typeof user === "number") return res.status(500).json({message: "server error..."});
    if(!user) res.status(400).json({message: "user not found..."});
    else {
        const verify = user.verify;
        if(!await replaceOne(verify as string, {id: user.id, name: user.name, email: user.email, surname: user.surname, password: user.password})) return res.status(500).json({message: "server error..."});
        res.json({message: "confirmed user"});
    }
});

router.get("/me", header("authorization").isJWT(), showErrors, async ({headers}, res) => {
    try{
        const user = (await jwt.verify(headers.authorization as string, sshKey)) as JwtPayload;
        if(await !isIn(user.email)) return res.status(400).json({message: "not autorizhed"});
        res.json({
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email
        });
    } catch(err) {
        res.status(400).json({message: "not autorizhed"});
    }
});


export default router;