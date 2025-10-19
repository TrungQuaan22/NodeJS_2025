
import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { User } from '~/models/schemas/users.schema';
dotenv.config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@twitter-dev.b5uscoc.mongodb.net/?retryWrites=true&w=majority&appName=twitter-dev`;
class DatabasesService {
  private client: MongoClient;
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    this.db = this.client.db(process.env.DB_NAME)

  }
  async run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await this.client.connect();
    // Send a ping to confirm a successful connection
    await this.db.command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }catch (e) {
    console.error(e);
  }
   finally {
    // Ensures that the client will close when you finish/error
    // await this.client.close();
  }
}
  get users() : Collection<User>{
    return this.db.collection('users')
  }
}
const databasesService = new DatabasesService();
export default databasesService;
// databasesService.


