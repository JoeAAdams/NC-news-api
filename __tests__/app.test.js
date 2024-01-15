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
        describe("/articles/:id", () => {
            test("returns object with correct keys", () => {
                return request(app)
                .get("/api/articles/1")
                .expect(200)
                .then(({body}) => {
                    const { article } = body
                    const ArtKeys = Object.keys(article[0])
                    expect(Object.keys(article).length).toBeGreaterThan(0)
                    expect(ArtKeys).toContain("author")
                    expect(ArtKeys).toContain("title")
                    expect(ArtKeys).toContain("article_id")
                    expect(ArtKeys).toContain("body")
                    expect(ArtKeys).toContain("topic")
                    expect(ArtKeys).toContain("created_at")
                    expect(ArtKeys).toContain("votes")
                    expect(ArtKeys).toContain("article_img_url")
                    
                })
            })
            test("Returns 404 with invalid ID", () => {
                return request(app)
                .get("/api/articles/20000")
                .expect(404)
            })
        })
    })
})