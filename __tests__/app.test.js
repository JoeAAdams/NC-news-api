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
            describe('?limit=value', () => {
                test('Return paginated result', () => {
                    return request(app)
                    .get("/api/articles?limit=5")
                    .expect(200)
                    .then(({body}) => {
                        expect(body.articles).toHaveLength(5);
                    })
                });
                test('Return 400 "Bad Request" with invalid query', () => {
                    return request(app)
                    .get("/api/articles?limit=notanumber")
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request");
                    })
                })
            });
            describe('?p=value', () => {
                test('Return correct page', () => {
                    return request(app)
                    .get("/api/articles?p=2&limit=5")
                    .expect(200)
                    .then(({body}) => {
                        const  { articles } = body
                        const expected = [
                            {
                                author: 'rogersop',
                                title: 'UNCOVERED: catspiracy to bring down democracy',
                                article_id: 5,
                                topic: 'cats',
                                created_at: '2020-08-03T13:14:00.000Z',
                                votes: 0,
                                article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                comment_count: '2'
                            },
                            {
                                author: 'butter_bridge',
                                title: 'Living in the shadow of a great man',
                                article_id: 1,
                                topic: 'mitch',
                                created_at: '2020-07-09T20:11:00.000Z',
                                votes: 100,
                                article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                comment_count: '11'
                            },
                            {
                                author: 'butter_bridge',
                                title: "They're not exactly dogs, are they?",
                                article_id: 9,
                                topic: 'mitch',
                                created_at: '2020-06-06T09:10:00.000Z',
                                votes: 0,
                                article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                comment_count: '2'
                            },
                            {
                                author: 'rogersop',
                                title: 'Seven inspirational thought leaders from Manchester UK',
                                article_id: 10,
                                topic: 'mitch',
                                created_at: '2020-05-14T04:15:00.000Z',
                                votes: 0,
                                article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                comment_count: '0'
                            },
                            {
                                author: 'rogersop',
                                title: 'Student SUES Mitch!',
                                article_id: 4,
                                topic: 'mitch',
                                created_at: '2020-05-06T01:14:00.000Z',
                                votes: 0,
                                article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                                comment_count: '0'
                            }
                        ]
                        expect(articles).toMatchObject(expected);
                    })
                });
                test('Return 400 "Bad Request" with invalid query', () => {
                    return request(app)
                    .get("/api/articles?limit=notanumber")
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("Bad Request");
                    })
                })
            });
            describe("?topic=query", () => {
                test("Returns filted results, paginated to 10", () => {
                    return request(app)
                    .get("/api/articles?topic=mitch&limit=15")
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
                    test("Returns 400 \"Bad Request\" with invalid ID", () => {
                        return request(app)
                        .get("/api/articles/notanumber/comments")
                        .expect(400)
                        .then(({body}) => {
                            expect(body.msg).toBe("Bad Request")
                        })
                    })
                    describe('?limit=value', () => {
                        test('Return paginated result', () => {
                            return request(app)
                            .get("/api/articles/1/comments?limit=5")
                            .expect(200)
                            .then(({body}) => {
                                expect(body.comments).toHaveLength(5);
                            })
                        });
                        test('Return 400 "Bad Request" with invalid query', () => {
                            return request(app)
                            .get("/api/articles/1/comments?limit=notanumber")
                            .expect(400)
                            .then(({body}) => {
                                expect(body.msg).toBe("Bad Request");
                            })
                        })
                    });
                    describe('?p=value', () => {
                        test('Return correct page', () => {
                            return request(app)
                            .get("/api/articles/1/comments?limit=5&p=2")
                            .expect(200)
                            .then(({body}) => {
                                const  { comments } = body
                                const expected = [
                                    {
                                        comment_id: 8,
                                        body: 'Delicious crackerbreads',
                                        article_id: 1,
                                        author: 'icellusedkars',
                                        votes: 0,
                                        created_at: '2020-04-14T20:19:00.000Z'
                                      },
                                      {
                                        comment_id: 6,
                                        body: 'I hate streaming eyes even more',
                                        article_id: 1,
                                        author: 'icellusedkars',
                                        votes: 0,
                                        created_at: '2020-04-11T21:02:00.000Z'
                                      },
                                      {
                                        comment_id: 12,
                                        body: 'Massive intercranial brain haemorrhage',
                                        article_id: 1,
                                        author: 'icellusedkars',
                                        votes: 0,
                                        created_at: '2020-03-02T07:10:00.000Z'
                                      },
                                      {
                                        comment_id: 3,
                                        body: 'Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.',
                                        article_id: 1,
                                        author: 'icellusedkars',
                                        votes: 100,
                                        created_at: '2020-03-01T01:13:00.000Z'
                                      },
                                      {
                                        comment_id: 4,
                                        body: ' I carry a log — yes. Is it funny to you? It is not to me.',
                                        article_id: 1,
                                        author: 'icellusedkars',
                                        votes: -100,
                                        created_at: '2020-02-23T12:01:00.000Z'
                                      }
                                ]
                                expect(comments).toMatchObject(expected);
                            })
                        });
                        test('Return 400 "Bad Request" with invalid query', () => {
                            return request(app)
                            .get("/api/articles/1/comments?p=notanumber")
                            .expect(400)
                            .then(({body}) => {
                                expect(body.msg).toBe("Bad Request");
                            })
                        })
                    });
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
        describe("/articles", () => {
            test('Return added article with correct keys', () => {
                return request(app)
                .post('/api/articles')
                .send({
                    author: "butter_bridge",
                    title: "A title",
                    body: "A body",
                    topic: "cats",
                    article_img_url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&psig=AOvVaw0WVD3FM7nIYyplKwsFlkkC&ust=1705678474611000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCNCzqNuh54MDFQAAAAAdAAAAABAD"
                })
                .expect(201)
                .then(({body}) =>{
                    const { article } = body
                    const ArtKeys = Object.keys(article)
                    expect(Object.keys(article).length).toBeGreaterThan(0)
                    expect(ArtKeys).toEqual(expect.arrayContaining(["author","title","article_id","body","topic","created_at","votes","article_img_url","comment_count"]))
                    expect(article.article_img_url).toBe("https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&psig=AOvVaw0WVD3FM7nIYyplKwsFlkkC&ust=1705678474611000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCNCzqNuh54MDFQAAAAAdAAAAABAD")
                    expect(article.article_id).toBe(14)
                    expect(article.comment_count).toBe(0)
                }) 
            });
            test('Return added article with default img when none provided', () => {
                return request(app)
                .post('/api/articles')
                .send({
                    author: "butter_bridge",
                    title: "A title",
                    body: "A body",
                    topic: "cats",
                })
                .expect(201)
                .then(({body}) =>{
                    const { article } = body
                    expect(article.article_img_url).toBe("https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700")
                }) 
            });
            test('Return 400 \'Bad Request\' when missing properties in request', () => {
                return request(app)
                .post('/api/articles')
                .send({
                    author: "butter_bridge",
                    title: "A title",
                    topic: "cats",
                    article_img_url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&psig=AOvVaw0WVD3FM7nIYyplKwsFlkkC&ust=1705678474611000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCNCzqNuh54MDFQAAAAAdAAAAABAD"
                })
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe('Bad Request')
                })
            });
            describe('/:article_id', () => {
                describe('/comments', () => {
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
                });
            });
        })
        describe('/topics', () => {
            test('Returns newly added object', () => {
                return request(app)
                .post('/api/topics')
                .send({
                    "slug": "topic name here",
                    "description": "description here"
                })
                .expect(201)
                .then(({body}) => {
                    const {topic} = body
                    const expected = {
                        "slug": "topic name here",
                        "description": "description here"
                    }
                    expect(topic).toMatchObject(expected);
                })
            });
            test('Returns 400 "Bad Request" with invalid input', () => {
                return request(app)
                .post('/api/topics')
                .send({
                    "slug": "topic name here",
                    "awawfawfawf": "description here"
                })
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request");
                })
            })         
        });
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