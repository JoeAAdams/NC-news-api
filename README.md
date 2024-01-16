# Northcoders News API

https://nc-news-wpw8.onrender.com/api


Summary:
    An API with access to different news articles, with comments from different users that have their own database, and topics attached

## How to install

- Click the green code button, and copy the HTTPS link
- run git clone ```https linkhere```

run ```$npm install -D``` to download dependencies for development

To seed local data base run ```$npm run seed```
To run tests run ```$npm test```

Create the following files
- .env.development
    -inside PGDATABASE=nc_news
- .env.test
    -inside PGDATABASE=nc_news_test


Node v21.2.0
Postgress v14.10