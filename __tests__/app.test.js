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
        describe("/topics", () => {
            test("all results should contain correct keys", () => {
                return request(app)
                .get("/api/topics")
                .expect(200)
                .then(({body}) => {
                    const { topics } = body
                    topics.forEach(topic => {
                        expect(Object.keys(topic)).toMatchObject(["slug","description"])
                    });
                })
            })
        })
    })
})