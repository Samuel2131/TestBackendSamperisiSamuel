
import express from "express";
import { deleteOne, find, getAll, insertOne } from "../db/db";
import { body, param, query, header } from "express-validator";
import { controlName, isAuth, showErrors } from "../utils/utils";

const router = express.Router();

router.get("/", query("minCost").optional().isFloat({min: 0, max: 200}), query("maxCost").optional().isFloat({min: 0, max: 200}), query("minDuration").optional().isFloat({min: 10, max: 7200}), 
        query("maxDuration").optional().isFloat({min: 10, max: 7200}), query("category").optional().isString(), query("maxNumSub").optional().isFloat({min: 5, max: 300}), showErrors,  async ({ query }, res) => {
            let response = await getAll();
            if(response === 500) return res.status(500).json({message: "Server error..."});
            if(query.minCost && typeof response !== "number") response = response.filter(({cost}) => Number(cost) >= Number(query.minCost));
            if(query.maxCost && typeof response !== "number") response = response.filter(({cost}) => Number(cost) <= Number(query.maxCost));
            if(query.minDuration && typeof response !== "number") response = response.filter(({duration}) => Number(duration) >= Number(query.minDuration));
            if(query.maxDuration && typeof response !== "number") response = response.filter(({duration}) => Number(duration) <= Number(query.maxDuration));
            if(query.category && typeof response !== "number") response = response.filter(({category}) => category === query.category);
            if(query.maxNumSub && typeof response !== "number") response = response.filter(({maxNumSub}) => Number(maxNumSub) <= Number(query.maxNumSub));
            res.json(response);
        });

router.get("/:id", param("id").isMongoId(), showErrors, async ({params}, res) => {
    const response = await find(params.id);
    if(!response) res.status(404).json({message: "course not found..."});
    else if(response === 500) res.status(500).json({message: "Server error..."});
    else res.json(response);
});

//set the duration in minutes
router.post("/", header("authorization").isJWT(), body("name").notEmpty().isString(), body("category").notEmpty().isString(), body("duration").notEmpty().isFloat({min: 10, max: 7200}),
                body("cost").notEmpty().isFloat({min: 0, max: 200}), body("maxNumSub").notEmpty().isFloat({min: 5, max: 300}), showErrors, controlName,
                isAuth, async ({ body }, res) => {
                    const response = await insertOne(body);
                    if(response === 500) res.status(response).json({message: "Server error..."});
                    else res.status(201).json(response);
                });

router.delete("/:id", header("authorization").isJWT(), param("id").isMongoId(), showErrors, isAuth, async ({params}, res) => {
    const response = await deleteOne(params.id);
    if(response === 404) res.status(response).json({message: "Course not found..."});
    else if(response === 500) res.status(response).json({message:  "Server error..."});
    else res.json({message: "Course successfully deleted"});
});

export default router;