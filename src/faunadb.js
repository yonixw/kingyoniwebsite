var faunadb = require('faunadb'),
    q = faunadb.query;

require("dotenv").config();

var serverClient = new faunadb.Client({ secret: process.env.FAUNA_API });


async function addDocument(coll, doc) {
    return serverClient.query(
        q.Create(
            q.Collection(coll),
            { data: doc },
        )
    )
}

async function queryDocument(coll, refID) {
    return serverClient.query(
        q.Get(q.Ref(q.Collection(coll), refID))
    )
}

async function queryByIndex(indexName, value) {
    return serverClient.query(
        q.Get(q.Match(q.Index(indexName), value))
    )
}


async function queryUpdate(coll, index_id, doc) {
    return serverClient.query(
        q.Update(
            q.Ref(q.Collection(coll), index_id),
            { data: doc },
        )
    )
}

async function queryReplace(coll, index_id, doc) {
    return serverClient.query(
        q.Replace(
            q.Ref(q.Collection(coll), index_id),
            { data: doc },
        )
    )
}


async function deleteDocument(coll, index_id) {
    return serverClient.query(
        q.Delete(
            q.Ref(q.Collection(coll), index_id)
        )
    )
}


module.exports = {
    addDocument,
    queryDocument, queryByIndex,
    queryUpdate, queryReplace, deleteDocument
}




