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
        describe("/articles", () => {
            test("returns array of articles with correct keys", () =>{
                return request(app)
                .get("/api/articles")
                .expect(200)
                .then(({body}) => {
                    const { articles } = body
                    expect(Object.keys(articles).length).toBeGreaterThan(0)
                    articles.forEach((article) => {
                        const ArtKeys = Object.keys(article)
                        expect(ArtKeys).toEqual(expect.arrayContaining(["author","title","article_id","comment_count","topic","created_at","votes","article_img_url"]))
                        expect(ArtKeys).not.toContain("body")
                    });
                })
            })
            test("should be sorted by date descending", () =>{
                return request(app)
                .get("/api/articles")
                .expect(200)
                .then(({body}) => {
                    const { articles } = body
                    expect(articles).toBeSortedBy('created_at',{descending: true})
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
                    expect(ArtKeys).toEqual(expect.arrayContaining(["author","title","article_id","body","topic","created_at","votes","article_img_url"]))
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