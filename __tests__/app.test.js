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
        describe("/users", () => {
            test("returns array of users with correct keys", () =>{
                return request(app)
                .get("/api/users")
                .expect(200)
                .then(({body}) => {
                    const { users } = body
                    expect(Object.keys(users).length).toBeGreaterThan(0)
                    users.forEach((user) => {
                        const userKeys = Object.keys(user)
                        expect(userKeys).toEqual(expect.arrayContaining(["username","name","avatar_url"]))
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
                    expect(ArtKeys).toEqual(expect.arrayContaining(["author","title","article_id","body","topic","created_at","votes","article_img_url"]))
                    expect(article[0].article_id).toBe(1)
                })
            })
            test("Returns 404 \"Not Found\" with invalid ID", () => {
                return request(app)
                .get("/api/articles/20000")
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("Not Found")
                })
            })
            test("Returns 400 \"Bad Request\" with non-existant ID", () => {
                return request(app)
                .get("/api/articles/notanumber")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
        })
        describe("/articles/:article_id/comments", () => {
            test("returns object with correct keys", () => {
                return request(app)
                .get("/api/articles/1/comments")
                .expect(200)
                .then(({body}) => {
                    const { comments } = body
                    expect(comments.length).toBeGreaterThan(0)
                        comments.forEach(comment => {
                        const commentKeys = Object.keys(comment)
                        expect(commentKeys).toEqual(expect.arrayContaining(["comment_id","votes","created_at","author","body","article_id"]))
                        const commentValueTypes = Object.values(comment).map((value) => typeof value)
                        expect(commentValueTypes).toEqual(["number","string","number","string","number","string"])
                        expect(comment.article_id).toBe(1)
                    });
                });
            });
            test("Returns empty array if no comments for article", () =>{
                return request(app)
                .get("/api/articles/2/comments")
                .expect(200)
                .then(({body}) => {
                    expect(body.comments.length).toBe(0)
                })
            })
            // test("Returns 404 \"Not Found\" with non-existant ID", () => {
            //     return request(app)
            //     .get("/api/articles/20000/comments")
            //     .expect(404)
            //     .then(({body}) => {
            //         expect(body.msg).toBe("Not Found")
            //     })
            // })
            test("Returns 400 \"Bad Request\" with invalid ID", () => {
                return request(app)
                .get("/api/articles/notanumber/comments")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
        })
    })
    describe("POST", () => {
        describe("/articles/:article_id/comments", () => {
            test("Returns posted comment with 201 code",() => {
                return request(app)
                .post("/api/articles/1/comments")
                .send({
                    username: "butter_bridge",
                    body: "A new comment"
                })
                .expect(201)
                .then(({body}) => {
                    expect(body.comment).toBe("A new comment")
                })
            }) 
            test("Returns 404 \"User Not Found\" with none existant article",() => {
                return request(app)
                .post("/api/articles/1/comments")
                .send({
                    username: "John",
                    body: "A new comment"
                })
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("User Not Found")
            })
        })    
            test("Returns 404 \"Article Not Found\" with none existant article",() => {
                return request(app)
                .post("/api/articles/2000000/comments")
                .send({
                    username: "butter_bridge",
                    body: "A new comment"
                })
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("Article Not Found")
                })
            })
        })
    })
    describe("PATCH", () => {
        describe("/articles/:article_id", () => {
            test("Returns updated article with postive votes", () => {
                return request(app)
                .patch("/api/articles/1")
                .send({inc_votes: 50})
                .expect(200)
                .then(({body}) => {
                    const { article } = body
                    const expectedOutput =  {
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: "2020-07-09T20:11:00.000Z",
                        votes: 150,
                        article_img_url:
                          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                      }
                      expect(article[0]).toMatchObject(expectedOutput)
                })
            })
            test("Returns updated article with negative votes", () => {
                return request(app)
                .patch("/api/articles/1")
                .send({inc_votes: -50})
                .expect(200)
                .then(({body}) => {
                    const { article } = body
                    const expectedOutput =  {
                        article_id: 1,
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        created_at: "2020-07-09T20:11:00.000Z",
                        votes: 50,
                        article_img_url:
                          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                      }
                      expect(article[0]).toMatchObject(expectedOutput)
                })
            })
            test("Returns 404 \"Article Not Found\" with none existant article",() => {
                return request(app)
                .patch("/api/articles/2000000")
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("Article Not Found")
                })
            })
            test("Returns 400 \"Bad Request\" with incorrect input",() => {
                return request(app)
                .patch("/api/articles/1")
                .send({something: "text"})
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
        })
    })
    describe("DELETE", () => {
        describe("/comments/:comment_id", () => {
            test("Returns status code of 204", () => {
                return request(app)
                .delete("/api/comments/1")
                .expect(204)
            })
        })
    })
})

        //TODO: WRITE TEST FOR NO USERNAME, AND TEST FOR NO ARTICLE