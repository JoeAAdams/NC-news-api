const request = require("supertest")
const app = require("../server/app")
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
            describe("?topic=query", () => {
                test("Returns filted results", () => {
                    return request(app)
                    .get("/api/articles?topic=mitch")
                    .expect(200)
                    .then(({body}) => {
                        const { articles } = body
                        expect(articles.length).toBe(12)
                        articles.forEach((article) => {
                            expect(article.topic).toBe("mitch")
                        })
                    })
                })
                test("Returns 404 \"Topic Not Found\" when none valid topic", ()=>{
                    return request(app)
                    .get("/api/articles?topic=notarealtopic")
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).toBe("Topic Not Found")
                    })
                })
                test("Returns empty array if no articles connected to topic", () => {
                    return request(app)
                    .get("/api/articles?topic=paper")
                    .then(({body}) => {
                        const { articles } = body
                        expect(articles.length).toBe(0)
                    })
                })
            })
            describe("?sort_by=query", () => {
                test('Returns sorted list', () => {
                    return request(app)
                    .get("/api/articles?sort_by=title")
                    .expect(200)
                    .then(({body}) => {
                        const { articles } = body
                        expect(articles).toBeSortedBy("title", {descending: true})
                    })
                })
                test('Return 400 \"Bad Request\" if invalid query', () => {
                    return request(app)
                    .get("/api/articles/sort_by=notacollumn")
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request")
                    })
                });
                test('Prevents SQL injection', () => {
                    return request(app)
                    .get("/api/articles/sort_by=title;DELETE * FROM articles;")
                    .expect(400)
                    .then(({body})=>{
                        expect(body.msg).toBe("Bad Request")
                    })
                });
            })
            describe('?order=query', () => {
                test('Returns ordered list ascending', () => {
                    return request(app)
                    .get("/api/articles?order=asc")
                    .expect(200)
                    .then(({body}) => {
                        const { articles } = body
                        expect(articles).toBeSortedBy("created_at", {ascending: true})
                    })
                })
                test('Return 400 \"Bad Request\" if invalid query', () => {
                    return request(app)
                    .get("/api/articles/order=helloworld")
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request")
                    })
                });
                test('Prevents SQL injection', () => {
                    return request(app)
                    .get("/api/articles/order=asc;DELETE * FROM articles;")
                    .expect(400)
                    .then(({body})=>{
                        expect(body.msg).toBe("Bad Request")
                    })
                });
            });
            describe("/:article_id", () => {
                test("returns object with correct keys", () => {
                    return request(app)
                    .get("/api/articles/1")
                    .expect(200)
                    .then(({body}) => {
                        const { article } = body
                        const ArtKeys = Object.keys(article[0])
                        expect(Object.keys(article).length).toBeGreaterThan(0)
                        expect(ArtKeys).toEqual(expect.arrayContaining(["author","title","article_id","body","topic","created_at","votes","article_img_url","comment_count"]))
                        expect(article[0].article_id).toBe(1)
                        expect(article[0].comment_count).toBe(11)
                    })
                })
                test("article with no comments should have comment count of 0", () => {
                    return request(app)
                    .get("/api/articles/4")
                    .expect(200)
                    .then(({body}) => {
                        const { article } = body
                        expect(article[0].comment_count).toBe(0)
                    })
                })
                test("Returns 404 \"Not Found\" with non-existant ID", () => {
                    return request(app)
                    .get("/api/articles/20000")
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).toBe("Not Found")
                    })
                })
                test("Returns 400 \"Bad Request\" with invalid ID", () => {
                    return request(app)
                    .get("/api/articles/notanumber")
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request")
                    })
                })
                describe("/comments", () => {
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
            describe('/:username', () => {
                test("returns object with correct keys", () => {
                    return request(app)
                    .get("/api/users/butter_bridge")
                    .expect(200)
                    .then(({body}) => {
                        const { user } = body
                        const userKeys = Object.keys(user[0])
                        expect(Object.keys(user).length).toBeGreaterThan(0)
                        expect(userKeys).toEqual(expect.arrayContaining(["username","avatar_url","name"]))
                        expect(user[0].username).toBe('butter_bridge')
                    })
                })
                test("Returns 404 \"Not Found\" with non-existant ID", () => {
                    return request(app)
                    .get("/api/users/thisuserisntreal")
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).toBe("Not Found")
                    })
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
        describe("/articles", () => {
            describe('/:article_id', () => {
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
                test("Returns 400 \"Bad Request\" with invalid ID",() => {
                    return request(app)
                    .patch("/api/articles/notanumber")
                    .send({something: "text"})
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request")
                    })
                })           
            });
        })
        describe('/comments', () => {
            describe('/:comment_id', () => {
                test("Returns updated comment with postive votes", () => {
                    return request(app)
                    .patch("/api/comments/1")
                    .send({inc_votes: 50})
                    .expect(200)
                    .then(({body}) => {
                        const { comment } = body
                        const expectedOutput =    {
                            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                            votes: 66,
                            author: "butter_bridge",
                            article_id: 9,
                            created_at: "2020-04-06T12:17:00.000Z",
                          }
                          expect(comment[0]).toMatchObject(expectedOutput)
                    })
                })
                test("Returns updated comment with negative votes", () => {
                    return request(app)
                    .patch("/api/comments/1")
                    .send({inc_votes: -50})
                    .expect(200)
                    .then(({body}) => {
                        const { comment } = body
                        const expectedOutput =    {
                            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                            votes: -34,
                            author: "butter_bridge",
                            article_id: 9,
                            created_at: "2020-04-06T12:17:00.000Z",
                          }
                          expect(comment[0]).toMatchObject(expectedOutput)
                    })
                })
                test("Returns 404 \"Not Found\" with none existant comment",() => {
                    return request(app)
                    .patch("/api/comments/2000000")
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).toBe("Not Found")
                    })
                })
                test("Returns 400 \"Bad Request\" with incorrect input",() => {
                    return request(app)
                    .patch("/api/comments/1")
                    .send({something: "text"})
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request")
                    })
                })
                test("Returns 400 \"Bad Request\" with invalid ID",() => {
                    return request(app)
                    .patch("/api/comments/notanumber")
                    .send({inc_votes: 30})
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request")
                    })
                })
            });
        });
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