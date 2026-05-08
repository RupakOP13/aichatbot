import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');
    
    const User = mongoose.connection.db.collection('users');
    await User.updateOne(
      { username: 'testuser1' }, 
      { 
        $set: { 
          plan: 'pro', 
          documentLimit: 100, 
          subscriptionStatus: 'active' 
        } 
      }
    );
    
    const updated = await User.findOne({ username: 'testuser1' });
    console.log('--- UPDATED USER ---');
    console.log(updated);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verify();
