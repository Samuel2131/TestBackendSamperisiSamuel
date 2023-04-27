
import request from "supertest"
require("chai").should();
import { app } from "../app";
import { deleteOne, dropDatabase, find, insertOne } from "../db/db";
import { expect } from "chai";
import { dropUserDB, insertUser } from "../db/dbUsers";
import { v4 } from "uuid";
import bcrypt from "bcrypt";

const pathEndpoint = "/v1/courses";
const userEndpoint = "/v1/users/";

const saltRounds = 10;

describe("endpoints", () => {
    let token: string;
    const user = {
        id: v4(),
        name: "Carlo",
        surname: "Leonardi",
        email: "carloleonardi83@gmail.com",
        password: "",
        verify: v4(),
    };
    const course = {
        name: "WebBackend",
        category: "Programming",
        duration: 5400,
        cost: 0,
        maxNumSub: 25
    }
    before(async () => {
        user.password = await bcrypt.hash("test-password", saltRounds);
        await insertUser(user);
        await request(app).get(`${userEndpoint}/validate/${user.verify}`).send();
        const userLogged = await request(app).post(`${userEndpoint}/login`).send({email: "carloleonardi83@gmail.com", password: "test-password"});
        token = userLogged.body.token;
    })
    describe("insert course", async () => {
        it("test 401 for not authorized", async () => {
            const { status } = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: "wrong-token" });
            status.should.be.equal(401);
        });
        it("test 201 for correct insert", async () => {
            const {body, status} = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            status.should.be.equal(201);
            
            body.should.have.property("_id");
            body.should.have.property("name");
            body.should.have.property("category");
            body.should.have.property("duration");
            body.should.have.property("cost");
            body.should.have.property("maxNumSub");
        });
        it("test 409 for name already present", async () => {
            const { status } = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            status.should.be.equal(409);
        });
        it("test 400 invalid body", async () => {
            course.name = "WebBackend2";
            const {status: s1} = await request(app).post(`${pathEndpoint}`).send({name: "WebBackend", category: "Programming", duration: 5400, cost: 0}).set({ authorization: token });
            s1.should.be.equal(400);

            const {status: s2} = await request(app).post(`${pathEndpoint}`).send({name: "WebBackend", category: "Programming", duration: 5400, maxNumSub: 25}).set({ authorization: token });
            s2.should.be.equal(400);

            const {status: s3} = await request(app).post(`${pathEndpoint}`).send({name: "WebBackend", category: "Programming", cost: 0, maxNumSub: 25}).set({ authorization: token });
            s3.should.be.equal(400);

            const {status: s4} = await request(app).post(`${pathEndpoint}`).send({name: "WebBackend", cost: 0, duration: 5400, maxNumSub: 25}).set({ authorization: token });
            s4.should.be.equal(400);

            const {status: s5} = await request(app).post(`${pathEndpoint}`).send({category: "Programming", cost: 0, duration: 5400, maxNumSub: 25}).set({ authorization: token });
            s5.should.be.equal(400);
        });
        it("test 400 for invalid cost", async () => {
            course.cost = -10;
            const {status: s1} = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            s1.should.be.equal(400);

            course.cost = 1000;
            const {status: s2} = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            s2.should.be.equal(400);
        });
        it("test 400 for invalid duration", async () => {
            course.duration = 1;
            const {status: s1} = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            s1.should.be.equal(400);

            course.duration = 8000;
            const {status: s2} = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            s2.should.be.equal(400);
        });
        it("test 400 for invalid maxNumSub", async () => {
            course.maxNumSub = -90;
            const {status: s1} = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            s1.should.be.equal(400);

            course.maxNumSub = 900;
            const {status: s2} = await request(app).post(`${pathEndpoint}`).send(course).set({ authorization: token });
            s2.should.be.equal(400);
        });
    });
    describe("get all courses", async () => {
        const course2 = {
            name: "Programmazione2",
            category: "Programming",
            duration: 4200,
            cost: 30,
            maxNumSub: 24
        };
        before(async () => {
            await insertOne(course2);
        });
        it("test 200 for get all courses", async () => {
            const {body, status} = await request(app).get(`${pathEndpoint}`).send();
            status.should.be.equal(200);

            body.should.have.property("length");
        });
        it("test filter by cost", async () => {
            const {body, status} = await request(app).get(`${pathEndpoint}?minCost=10&maxCost=40`).send();
            status.should.be.equal(200);

            expect(body.length).to.equal(1);
        });
        it("test filter by duration", async () => {
            const {body, status} = await request(app).get(`${pathEndpoint}?minDuration=5000`).send();
            status.should.be.equal(200);

            expect(body.length).to.equal(1);
            
            const {body: b2, status: s2} = await request(app).get(`${pathEndpoint}?maxDuration=5000`).send();
            s2.should.be.equal(200);

            expect(b2.length).to.equal(1);
        });
        it("test filter by category", async () =>{
            const {body, status} = await request(app).get(`${pathEndpoint}?category=Musica`).send();
            status.should.be.equal(200);

            expect(body.length).to.equal(0);
        });
        it("test filter by maxNumSub", async () =>{
            const {body, status} = await request(app).get(`${pathEndpoint}?maxNumSub=24`).send();
            status.should.be.equal(200);

            expect(body.length).to.equal(1);
        });
        it("test 400 for wrong filter", async () => {
            const { status } = await request(app).get(`${pathEndpoint}?maxNumSub=900`).send();
            status.should.be.equal(400);

            const { status: s2 } = await request(app).get(`${pathEndpoint}?minCost=-10`).send();
            s2.should.be.equal(400);

            const { status: s3 } = await request(app).get(`${pathEndpoint}?minDuration=-10`).send();
            s3.should.be.equal(400);
        });
    });
    describe("get course by id", async () => {
        const course3 = {
            name: "Pianosolo",
            category: "Musica",
            duration: 2100,
            cost: 90,
            maxNumSub: 12
        };
        let id: any;
        before(async () => {
            const newCourse: any = await insertOne(course3);
            id = newCourse._id;
        });
        it("test 200 for valid get by id", async () => {
            const {body, status} = await request(app).get(`${pathEndpoint}/${id}`).send();
            status.should.be.equal(200);

            body.name.should.be.equal(course3.name);
            body.category.should.be.equal(course3.category);
            body.duration.should.be.equal(course3.duration);
            body.cost.should.be.equal(course3.cost);
            body.maxNumSub.should.be.equal(course3.maxNumSub);
        });
        it("test 404 for course not found", async () => {
            await deleteOne(id);
            const { status } = await request(app).get(`${pathEndpoint}/${id}`).send();
            status.should.be.equal(404);
        });
        it("test 400 for invalid mongoId", async () => {
            const {status} = await request(app).get(`${pathEndpoint}/fakeID`).send();
            status.should.be.equal(400);
        });
    });
    describe("delete", async () => {
        const course3 = {
            name: "Pianosolo",
            category: "Musica",
            duration: 2100,
            cost: 90,
            maxNumSub: 12
        };
        let id: any;
        before(async () => {
            const newCourse: any = await insertOne(course3);
            id = newCourse._id;
        });
        after(async () => {
            await dropUserDB();
            await dropDatabase();
        });
        it("test 401 delete for not authorized", async () => {
            const { status } = await request(app).delete(`${pathEndpoint}/${id}`).send().set({ authorization: "wrong-token" });
            status.should.be.equal(401);
        });
        it("test 200 delete for valid delete", async () => {
            const { status } = await request(app).delete(`${pathEndpoint}/${id}`).send().set({ authorization: token });
            status.should.be.equal(200);

            expect(await find(id)).be.equal(null);
        });
        it("test 404 delete for course not found", async () => {
            const { status } = await request(app).delete(`${pathEndpoint}/${id}`).send().set({ authorization: token });
            status.should.be.equal(404);
        });
        it("test 400 delete for invalid mongoId", async () => {
            const {status} = await request(app).get(`${pathEndpoint}/fakeID`).send().set({ authorization: token });
            status.should.be.equal(400);
        });
    });
});