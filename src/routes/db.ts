
import mongoose from "mongoose";
import { urlDB } from "./utils";
import { CoursesDB, Course } from "./models";

mongoose.connect(urlDB);

export const insertOne = async (newObj: Course): Promise<Course | number> => {
    try{
        const course = new CoursesDB(newObj);
        await course.save();
        return course;
    } catch(e: any) {
        //if(e.code && e.code === 11000) return 409;
        return 500;
    }
}

export const find = async (id: string): Promise<Course | null | number> => {
    try{
        return await CoursesDB.findOne({_id: id});
    } catch(e) {
        return 500;
    }
}

export const findByCategory = async (categoryToFind: string): Promise<Course | null | number> => {
    try{
        return await CoursesDB.findOne({category: categoryToFind});
    } catch(e) {
        return 500;
    }
}

export const getAll = async (): Promise<Course[] | number> => {
    try{
        return await CoursesDB.find({});
    } catch (err) {
        return 500;
    }
}

export const isIn = async (nameCourse: string): Promise<boolean | number> => {
    const courses = await getAll(); 
    if(typeof courses !== "number") return (courses).some(({name}) => name === nameCourse);
    return 500;
}

export const deleteOne = async (filter: string): Promise<number> => {
    try {
        const result = await CoursesDB.deleteOne({_id: filter});
        return result.deletedCount === 0 ? 404 : 200;
    } catch (e: any) {
        return 500;
    }
}

export const dropDatabase = async () => {
    try {
        await CoursesDB.deleteMany({});
    } catch (err){
        console.error(err);
    }
}