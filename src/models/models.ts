
import mongoose from "mongoose";

export const CoursesSchema = new mongoose.Schema({
    name: {type: String, required:  true, unique: true},
    category : {type: String, required: true},
    duration : {type: Number, required: true},
    cost: {type: Number, required: true},
    maxNumSub: {type: Number, required: true}
}, {versionKey: false});

export const UserSchema = new mongoose.Schema({
    name: {type:String, required: true},
    email: {type:String, unique: true, required: true},
    surname: {type:String, required: true},
    password: {type:String, required: true},
    verify: String
}, {versionKey: false});

export const CoursesDB = mongoose.model("course", CoursesSchema);

export const UserDB = mongoose.model("user", UserSchema);

export type Course = {
    name: String,
    category : String,
    duration : Number,
    cost: Number,
    maxNumSub: Number
}

export type User = {
    id: string,
    name: string,
    email: string,
    surname: string,
    password: string,
    verify?: string
}