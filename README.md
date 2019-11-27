# My first GraphQL Backend application

To install 
```
npm i
```

To run 
```
node app.js
```

This repo does not include the [Front-End](https://github.com/sukibeww/graphql-frontend), but it does not need the front-end to run and I don't think I'm gonna host it because I didn't implemented any form of security in this application. So if you want to run it locally on your computer, you might need to setup the database environment (MongoDB) ... sorry kissing

## Libraries used in this project
* Node.js
* Express.js
* GraphQL
* Express-GraphQL
* Mongoose

---
## Intro
It was a very adventurous project because I find the resources for the tech specs of this project is a bit scarce and the whole thing is still a bit alien to me. I did this project out of curiousity because I've heard a bunch of senior devs great things about it and I thought "Hmmm... what so great about it? I'll give it a shot."

---
## Disclaimer 
This is my first experience ever working with GraphQL, I am not in anyway expert in any of this tech stack. I just have a functioning understanding of React and web application development. Please take all of the things that I wrote with a grain of salt and if you see any mistake feel free to leave me a message to correct me (pls). This project is purely passion project and completed with a ton of assumption and generalisation. 😅

---
## Objective 
Based on my very limited understanding and experience of GraphQL, I just want to make a simple application about books and author that covers all CRUD operations

    GET
    POST
    PUT/PATCH
    DELETE

Just to get a hang of the syntax and behaviour, because I expect there will be a major blocker during the development process and there was... a lot ... 😑

---
### Creating the supercharged endpoint
```js
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
.
.
.
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));
```

```'/graphql'``` is the end point, It could be anything you want and all we need to do is pass in the schema file into this end point.( not mongoose schema )

```graphiql: true```  (optional) 

Passing this in will provide a graphical interface for developer to play with the API and I find it super useful to test queries and mutation but probably should be removed before deployment.

![image](https://user-images.githubusercontent.com/42060507/69685995-6a604900-1112-11ea-95ca-191089f7c790.png)

---
## Writing GraphQL schema

This is the most important file of this API, because it will contain all of the GraphQL data model, queries and mutation.

#### Setup 
```js
//mandatory import 
const graphql = require('graphql');

//Mongoose schema
const Book = require('../models/book');
const Author = require('../models/author');

//destructure all of the GraphQL datatypes that you need here
const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql;
```
[GraphQL data types](https://graphql.org/graphql-js/type/)

#### Define our own model 

```js
const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: {type: GraphQLID}, 
        name: {type: GraphQLString},
        genre: {type: GraphQLString},
        author: {
            type: AuthorType,
            resolve(parent, args){
                return Author.findById(parent.authorId)
            }
        }
    })
});
```
The definition process is where we defined the name of our data model, what it contains and relational connection with other model. 

Book model contains 4 fields
* id (GraphQLID)
* name (GraphQLString)
* genre (GraphQLString) 
* author (AuthorType)

AuthorType is the author Model that I have defined it is the related to BookType. 
```js
{
  "data": {
    "book": {
      "id": "5ddbbb2b8cbd3f2ac7126c95",
      "name": "Harry Potter ",
      "genre": "Fantasy",
      "author": {
        "id": "5ddbbb288cbd3f2ac7126c94",
        "name": "J K Rowling"
      }
    }
  }
}
```

#### Define the RootQuery 
```js
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType', //It has to be exactly like this 
    fields: {
        book: {
            type: BookType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Book.findById(args.id)
            }
        },
        author: {
            type: AuthorType,
            args: {id : {type: GraphQLID}},
            resolve(parent, args){
                return Author.findById(args.id);
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                return Book.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                return Author.find({});
            }
        }
    }
});
```
This is where we defined our queries and what it returns.


```js
        book: {
            type: BookType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Book.findById(args.id)
            }
        },
```

#### Output type
```
type : BookType //Indicates the output type of this query 
```
#### Parameter

```parent``` will refer to the book itself , ```args.id``` will return the book.id

```args``` will refer to the parameter that is passed from the front-end.

#### Resolve

```js
return Book.findById(args.id)
```
This is a mongoose query function that returns that particular book with the provided id 

#### Conclusion 

This query will return a Book and takes in one parameter from the front-end with a key of ```id``` and GraphQLID data type. ```resolve``` function is responsible to get the actual data from the database and it takes in two parameter which is ```parent``` and ```args```. 

[Mongoose query functions](https://mongoosejs.com/docs/api/query.html)

## Writing the mutations

```js
const Mutation = new GraphQLObjectType({
    name: 'Mutation', //It has to be exactly like this 
    fields: {
        updateBook: {
            type: BookType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                const updatedBook = Book.findByIdAndUpdate(args.id, args, (err) => {
                    return err
                })
                return updatedBook;
            }
        },
        deleteBook : {
            type: BookType,
            args: {id: {type:  new GraphQLNonNull(GraphQLID)}},
            resolve(parent, args){
                const deletedBook = new Book({
                    name: "Deleted",
                    genre: "Deleted",
                    authorId: "Deleted"
                });
                Book.findByIdAndRemove(args.id, (err) => {
                    return err
                })
                return deletedBook;
            }
        },
        deleteBookByAuthor : {
            type: BookType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve(parent, args){
                const deletedBooks = new Book({
                    name: "Deleted",
                    genre: "Deleted",
                    authorId: "Deleted"
                });
                Book.deleteMany({authorId: args.id}, (err)=> {
                    if(err){
                        return err;
                    }
                    else{ 
                        return deletedBooks;
                    }
                })
                return deletedBooks;
            }
        },
        addAuthor: {
            type: AuthorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parent, args){
                let author = new Author({
                    name: args.name,
                    age: args.age
                });
                return author.save();
            }
        },
        deleteAuthor: {
            type: AuthorType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                const deletedAuthor = new Author({
                    name: "Delete",
                    age: 0
                })
                Author.findByIdAndDelete(args.id, (err) => {
                    if(err){
                        return err;
                    }
                    else{
                        return deletedAuthor;
                    }
                });
                return deletedAuthor;
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                return book.save();
            }
        }
    }
})
```
It follows the same pattern as root query definition.
* Name the mutation 
* Specify the output type
* Provide a resolve function (in this case not to get the data, but to make some changes in the database ) 

## Finally export it 👏
```js 
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
```

## That's all
```js
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
.
.
.
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));
```

Yeap, only one endpoint 😎. refer to my [Front-End](https://github.com/sukibeww/graphql-frontend) repository on how it's implemented with React and Apollo. 

# Thank you for reading