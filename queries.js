// Insert a single document
db.books.insertOne({
    "title": "The Catcher in the Rye",
    "author": "J.D. Salinger",
    "genre": "Literary Fiction",
    "publicationYear": 1951,
    "price": 9.99,
    "reviews": []
});

// Insert multiple documents
db.books.insertMany([
    {
        "title": "Dune",
        "author": "Frank Herbert",
        "genre": "Science Fiction",
        "publicationYear": 1965,
        "price": 14.50,
        "reviews": [{ "user": "Zoe", "rating": 5, "comment": "Epic!" }]
    },
    {
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "genre": "Non-Fiction",
        "publicationYear": 2011,
        "price": 18.75,
        "reviews": [{ "user": "Frank", "rating": 5, "comment": "Eye-opening." }]
    }
]);

// R - Read (Find)
// Find all documents in the 'books' collection
db.books.find({});

// Find documents with a specific filter
db.books.find({ "author": "George Orwell" });

// Find documents with projection (only show title and author)
db.books.find({}, { "title": 1, "author": 1, "_id": 0 }); // _id: 0 to exclude default _id

// U - Update
// Update one document: change price of a specific book
db.books.updateOne(
    { "title": "The Catcher in the Rye" },
    { $set: { "price": 10.99 } }
);

// Update many documents: increase price for all Science Fiction books
db.books.updateMany(
    { "genre": "Science Fiction" },
    { $inc: { "price": 1.00 } }
);

// Add a review to an existing book
db.books.updateOne(
    { "title": "1984" },
    { $push: { "reviews": { "user": "Grace", "rating": 4, "comment": "Still relevant today." } } }
);

// D - Delete
// Delete one document
db.books.deleteOne({ "title": "The Catcher in the Rye" });

// Delete many documents (e.g., all books published before 1900)
db.books.deleteMany({ "publicationYear": { $lt: 1900 } });


// --- 4. Advanced Queries ---

// Find books published after 1950 with a price less than $15
db.books.find({
    "publicationYear": { $gt: 1950 },
    "price": { $lt: 15 }
});

// Find books by "George Orwell" OR "Harper Lee"
db.books.find({
    $or: [
        { "author": "George Orwell" },
        { "author": "Harper Lee" }
    ]
});

// Find books where the genre is "Classic" and have at least one review with rating 5
db.books.find({
    "genre": "Classic",
    "reviews.rating": 5
});

// Find books, sort by publication year (ascending) then by title (ascending)
db.books.find({})
    .sort({ "publicationYear": 1, "title": 1 });

// Find the 3 most expensive books, showing only title and price
db.books.find({}, { "title": 1, "price": 1, "_id": 0 })
    .sort({ "price": -1 }) // -1 for descending
    .limit(3);

// Find books, skipping the first 2 results and limiting to 2 results
db.books.find({})
    .skip(2)
    .limit(2);

// Find books with a review by 'Alice'
db.books.find({
    "reviews": {
        $elemMatch: { "user": "Alice" }
    }
});

// --- 5. Aggregation Pipelines ---

// Count the total number of books
db.books.aggregate([
    { $count: "totalBooks" }
]);

// Group books by author and count how many books each author has
db.books.aggregate([
    {
        $group: {
            "_id": "$author",
            "bookCount": { $sum: 1 }
        }
    }
]);

// Calculate the average price of books per genre
db.books.aggregate([
    {
        $group: {
            "_id": "$genre",
            "averagePrice": { $avg: "$price" }
        }
    }
]);

// Find the total number of reviews for each book,
// then project only the title and total reviews,
// and sort by total reviews descending
db.books.aggregate([
    {
        $project: {
            "title": 1,
            "numberOfReviews": { $size: "$reviews" },
            "_id": 0
        }
    },
    {
        $sort: { "numberOfReviews": -1 }
    }
]);

// Find the average rating for each book,
// then sort by average rating descending,
// and only include books with at least one review.
db.books.aggregate([
    {
        $unwind: "$reviews" // Deconstructs the reviews array into individual documents
    },
    {
        $group: {
            "_id": "$title",
            "avgRating": { $avg: "$reviews.rating" },
            "totalReviews": { $sum: 1 }
        }
    },
    {
        $match: {
            "totalReviews": { $gt: 0 } // Filter out books with no reviews after unwind
        }
    },
    {
        $sort: { "avgRating": -1 }
    },
    {
        $project: {
            "bookTitle": "$_id",
            "averageRating": { $round: ["$avgRating", 2] }, // Round to 2 decimal places
            "totalReviews": 1,
            "_id": 0
        }
    }
]);

// Find the top 3 most expensive books using aggregation
db.books.aggregate([
    {
        $sort: { "price": -1 }
    },
    {
        $limit: 3
    },
    {
        $project: {
            "title": 1,
            "author": 1,
            "price": 1,
            "_id": 0
        }
    }
]);

// --- 6. Indexing for Performance Optimization ---

// Create a single-field ascending index on 'publicationYear'
db.books.createIndex({ "publicationYear": 1 });

// Create a compound index on 'genre' (ascending) and 'price' (descending)
db.books.createIndex({ "genre": 1, "price": -1 });

// Create a text index on 'title' and 'author' for full-text search
db.books.createIndex({ "title": "text", "author": "text" });

// Find books using the text index (requires a text index to be created)
db.books.find({ $text: { $search: "classic timeless" } });

// List all indexes on the 'books' collection
db.books.getIndexes();

// Drop a specific index (replace 'index_name' with the actual name from getIndexes())
// db.books.dropIndex("publicationYear_1");

// Drop all indexes on the 'books' collection (be careful with this in production!)
// db.books.dropIndexes();

