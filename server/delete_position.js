require('dotenv').config();
const mongoose = require('mongoose');
const Position = require('./models/Position');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talenthub';
const POSITION_NAME = 'Functional Test Engineer';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log(`Searching for position: "${POSITION_NAME}"...`);
    const result = await Position.deleteMany({ title: POSITION_NAME });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Successfully deleted ${result.deletedCount} instance(s) of "${POSITION_NAME}".`);
    } else {
      console.log(`⚠️ No position found with the name "${POSITION_NAME}".`);
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Deletion error:', err);
    process.exit(1);
  });
