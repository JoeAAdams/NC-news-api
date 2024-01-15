const request = require("supertest")
const app = require("../db/app")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")
const db = require("../db/connection")

beforeEach(() => {
    return seed(data)
})

afterAll(() => {
    return db.end()
})

describe("/api", () => {
    describe("GET", () => {
        test("returns object each with description key", () => {
            return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                const { endpoints } = body
                console.log(endpoints)
                expect(Object.keys(endpoints).length).toBeGreaterThan(0)
                for (const key in endpoints) {
                    expect(Object.keys(endpoints[key])).toContain("description")
                    expect(Object.keys(endpoints[key])).toContain("queries")
                    expect(Object.keys(endpoints[key])).toContain("exampleResponse")
                    expect(Object.keys(endpoints[key])).toContain("exampleRequest")
                }

            })
        })
        describe("/topics", () => {
            test("all results should contain correct keys", () => {
                return request(app)
                .get("/api/topics")
                .expect(200)
                .then(({body}) => {
                    const { topics } = body
                    expect(topics.length).toBeGreaterThan(0)
                    topics.forEach(topic => {
                        expect(Object.keys(topic)).toMatchObject(["slug","description"])
                    });
                })
            })
        })
    })
})