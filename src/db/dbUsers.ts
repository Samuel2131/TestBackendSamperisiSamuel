
import { UserDB, User } from "../models/models";

export const insertUser = async (newObj: User) => {
    try{
        const user = new UserDB(newObj);
        await user.save();
        return user;
    } catch(e: any) {
        if(e.code && e.code === 11000) return -2;
        return -1;
    }
}

export const getAll = async (): Promise<User[] | number> => {
    try{
        return await UserDB.find({});
    } catch (err) {
        return -1;
    }
}

export const replaceOne = async (filter: string, newUser: User): Promise<boolean> => {
    try {
        await UserDB.replaceOne({verify: filter}, newUser);
        return true;
    } catch (err) {
        return false;
    }
}

export const find = async (email: string): Promise<User | null | number> => {
    try{
        return await UserDB.findOne({email: email});
    } catch(e) {
        return -1;
    }
}

export const findWithVerify = async (verify: string): Promise<User | null | number> => {
    try{
        return await UserDB.findOne({verify: verify});
    } catch(e) {
        return -1;
    }
}

export const isIn = async (userEmail: string): Promise<boolean | number> => {
    const users = await getAll();
    if(typeof users !== "number") return (users).some(({email}) => email === userEmail);
    return -1;
}

export const dropUserDB = async () => {
    try {
        await UserDB.deleteMany({});
    } catch (err){
        console.error(err);
    }
}