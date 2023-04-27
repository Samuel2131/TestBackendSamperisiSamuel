
import {Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";
import { isIn } from "../db/db";
import jwt, { JwtPayload }  from "jsonwebtoken";

export const sshKey = "b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcnNhAAAAAwEAAQAAAIEA2UEBh9CoKjibnhIsg5Zygdmu75WMQISwKC9ectjRR1gNzsc/OZqqvd15RHaK06at3cEBqyl4FyeSlitlOQYZjasfbuKqXZ0gQqUZyO5zANX/QMg9RJmQaZotfvbqG9HM91rPszNxphD3i+hbf/M0PNJUx8D3s0nU7F5DAUrRbEkAAAIQQLDHvECwx7wAAAAHc3NoLXJzYQAAAIEA2UEBh9CoKjibnhIsg5Zygdmu75WMQISwKC9ectjRR1gNzsc/OZqqvd15RHaK06at3cEBqyl4FyeSlitlOQYZjasfbuKqXZ0gQqUZyO5zANX/QMg9RJmQaZotfvbqG9HM91rPszNxphD3i+hbf/M0PNJUx8D3s0nU7F5DAUrRbEkAAAADAQABAAAAgQCYLXK3Aa9ps7E9rhlEKxQWZLam16ggYVFLNLMB22HsiX9SgjqFTROgXwxcqnRgAPb0yAc1L50RCwUg71C9+snWKaFXLz15QAFYLFiUjkeE3E8tDFU1h15QH314bPqqeqjOq2wTcuoRLGAMEpWEZASdRzQ6cNp/0W2+DivBmtcUAQAAAEEA3wOPx3eHHz3Vo/R3OvvROS8vcQnrqhgO4IMCQBryuQFZ8suJkYUC61Jv2LL43XDZkfoByRY23MXQmQsQBheQ4wAAAEEA86otqU7sda+AhNZ41iBSH7WKCmMuyUt6aVrsN7Rceq6ng38YRrYplBpSbBhWgXByUN/Y7FU8HFqWeZwjbCfHQQAAAEEA5ECNHlclMT2nOeZmxqALyWSp4npHnuI4T/bxwjzPeLz7PhlNeKFGlO0PRFTKKjvK4ssxp5qTkvxftV/VQZOrCQAAABR1c2VyQExBUFRPUC00Q04wN1NBUwECAwQF";

export const urlDB = `mongodb+srv://samperisisamuel:${process.env.PASSWORD}@UserDB.yvd6jyw.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;

export const showErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array();
    if(errors.length !== 0 && errors[0].location === "headers" && errors[0].param === "authorization") return res.status(401).json({errors});
    validationResult(req).isEmpty() ? next() : res.status(400).json({errors});
}

export const controlName = async (req: Request, res: Response, next: NextFunction) => !(await isIn(req.body.name)) ? next() : res.status(409).json({message: "name is already present..."}); 

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    try{
        const user = (jwt.verify(req.headers.authorization as string, sshKey)) as JwtPayload;
        if(!isIn(user.email)) return res.status(401).json({message: "not autorizhed"})
        else next();
    } catch (e){
        res.status(401).json({message: "invalid token..."});
    }
}